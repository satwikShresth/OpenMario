import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { parseOffersText, type OffersCommon } from '@/lib/offers-parser';
import { recognizeImage } from '@/lib/ocr';
import { storeParse, getParse, hashImage } from '@/lib/parse-cache';
import {
   createUploadSlot,
   publicBaseUrl,
   stripDataUrl,
   takeUpload
} from '@/lib/upload-cache';
import { submitParsedOffers } from '@/lib/submit-offers';
import { getDb } from '@/lib/db';
import { getMeili } from '@/lib/meili';
import { textResult, errorResult } from '@/lib/json';

const coopCommon = {
   year: z.number().int().min(2005).describe('Calendar year of the co-op'),
   coop_year: z.enum(['1st', '2nd', '3rd']),
   coop_cycle: z.enum([
      'Fall/Winter',
      'Winter/Spring',
      'Spring/Summer',
      'Summer/Fall'
   ]),
   program_level: z.enum(['Undergraduate', 'Graduate']),
   coop_round: z.enum(['A', 'B', 'C']).optional().default('A')
};

export function registerSalaryTools(server: McpServer) {
   server.registerTool(
      'request_offers_upload',
      {
         title: 'Request offers screenshot upload',
         description:
            'PREFERRED for Claude.ai / remote connectors: get a short-lived upload URL so the client can send the DrexelOne rankings/offers screenshot bytes (not hallucinated base64). After PUT succeeds, call parse_offers_screenshot with the upload_id. Cursor/Claude Code may instead pass image_base64 directly to parse_offers_screenshot when they can read a local file.',
         inputSchema: {},
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async () => {
         try {
            const upload_id = createUploadSlot();
            const upload_url = `${publicBaseUrl()}/uploads/${upload_id}`;
            return textResult({
               upload_id,
               upload_url,
               expires_in_seconds: 900,
               how_to_upload: [
                  `PUT the raw image bytes to ${upload_url} with Content-Type image/png (or jpeg/webp).`,
                  `Or POST JSON {"mime_type":"image/png","image_base64":"<base64>"} to the same URL.`,
                  'Claude.ai: if code execution / sandbox is available, curl the user-attached screenshot to upload_url, then call parse_offers_screenshot with upload_id.',
                  'Do NOT invent base64 from vision — Claude cannot reliably re-encode chat attachments into tool args.'
               ],
               curl_example: `curl -X PUT "${upload_url}" -H "Content-Type: image/png" --data-binary @drexel-offers.png`,
               next_step:
                  'After a 200 upload response, call parse_offers_screenshot with upload_id + year/coop_year/coop_cycle/program_level.'
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'parse_offers_screenshot',
      {
         title: 'Parse offers screenshot',
         description:
            'OCR a DrexelOne co-op rankings/offers screenshot and return structured offers. Required before submitting salaries. Provide upload_id from request_offers_upload (preferred on Claude.ai), OR image_base64 when the client can send real file bytes (Cursor / Claude Code reading a local path). Never invent wages from vision alone for submission — the image must reach this tool.',
         inputSchema: {
            upload_id: z
               .string()
               .optional()
               .describe(
                  'From request_offers_upload after the screenshot was PUT/POSTed'
               ),
            image_base64: z
               .string()
               .min(100)
               .optional()
               .describe(
                  'Raw base64 screenshot (data: URL prefix allowed). Prefer upload_id on Claude.ai.'
               ),
            mime_type: z
               .enum(['image/png', 'image/jpeg', 'image/webp'])
               .optional()
               .default('image/png'),
            ...coopCommon
         },
         annotations: {
            readOnlyHint: true,
            openWorldHint: false
         }
      },
      async (args, extra) => {
         try {
            let imageBase64 = args.image_base64
               ? stripDataUrl(args.image_base64)
               : undefined;
            let mimeType = args.mime_type ?? 'image/png';

            if (args.upload_id) {
               const uploaded = takeUpload(args.upload_id);
               if (!uploaded) {
                  return errorResult(
                     `No image for upload_id ${args.upload_id}. Call request_offers_upload, PUT/POST the screenshot to upload_url, then retry parse_offers_screenshot.`
                  );
               }
               imageBase64 = uploaded.imageBase64;
               mimeType = (uploaded.mimeType as typeof mimeType) || mimeType;
            }

            if (!imageBase64) {
               return errorResult(
                  'Provide upload_id (after uploading) or image_base64 with real screenshot bytes. On Claude.ai use request_offers_upload — do not invent base64.'
               );
            }

            const common: OffersCommon = {
               year: args.year,
               coop_year: args.coop_year,
               coop_cycle: args.coop_cycle,
               program_level: args.program_level,
               coop_round: args.coop_round ?? 'A'
            };

            const text = await recognizeImage(
               imageBase64,
               mimeType,
               async (progress, status) => {
                  try {
                     await server.sendLoggingMessage(
                        {
                           level: 'info',
                           data: `OCR ${status}: ${Math.round(progress * 100)}%`
                        },
                        extra.sessionId
                     );
                  } catch {
                     // logging optional
                  }
               }
            );

            const offers = parseOffersText(text, common);
            if (offers.length === 0) {
               return errorResult(
                  'No offers detected. Ensure the screenshot shows DrexelOne rankings between the header/footer markers and includes Employer:/Wages blocks.'
               );
            }

            const imageHash = hashImage(imageBase64);
            const parse_token = storeParse(imageHash, common, offers);

            return textResult({
               parse_token,
               offer_count: offers.length,
               offers: offers.map((o, index) => ({
                  index,
                  company: o.company,
                  position: o.position,
                  location: o.location,
                  compensation: o.compensation,
                  work_hours: o.work_hours,
                  status: o.status,
                  ranking_status: o.ranking_status,
                  other_compensation: o.other_compensation
               })),
               next_step:
                  'Call submit_salaries_from_offers with this parse_token (and optional indices) to write salaries.'
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'submit_salaries_from_offers',
      {
         title: 'Submit salaries from offers',
         description:
            'Write salary submissions ONLY after a successful offers-page screenshot parse. Provide parse_token from parse_offers_screenshot. Free-form salary create without a screenshot is not allowed. Do not invent offers from vision.',
         inputSchema: {
            parse_token: z
               .string()
               .optional()
               .describe('Token from parse_offers_screenshot (preferred)'),
            indices: z
               .array(z.number().int().min(0))
               .optional()
               .describe('Optional offer indices to submit; defaults to all'),
            upload_id: z
               .string()
               .optional()
               .describe(
                  'If parse_token missing: upload_id of an already-uploaded screenshot (will re-OCR)'
               ),
            image_base64: z
               .string()
               .optional()
               .describe(
                  'If parse_token missing: raw screenshot base64 (prefer upload_id on Claude.ai)'
               ),
            mime_type: z
               .enum(['image/png', 'image/jpeg', 'image/webp'])
               .optional()
               .default('image/png'),
            year: z.number().int().min(2005).optional(),
            coop_year: z.enum(['1st', '2nd', '3rd']).optional(),
            coop_cycle: z
               .enum([
                  'Fall/Winter',
                  'Winter/Spring',
                  'Spring/Summer',
                  'Summer/Fall'
               ])
               .optional(),
            program_level: z.enum(['Undergraduate', 'Graduate']).optional(),
            coop_round: z.enum(['A', 'B', 'C']).optional().default('A')
         },
         annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false
         }
      },
      async args => {
         try {
            let offers = getParse(args.parse_token ?? '')?.offers;

            if (!offers) {
               let imageBase64 = args.image_base64
                  ? stripDataUrl(args.image_base64)
                  : undefined;
               let mimeType = args.mime_type ?? 'image/png';

               if (args.upload_id) {
                  const uploaded = takeUpload(args.upload_id);
                  if (!uploaded) {
                     return errorResult(
                        `No image for upload_id ${args.upload_id}.`
                     );
                  }
                  imageBase64 = uploaded.imageBase64;
                  mimeType = (uploaded.mimeType as typeof mimeType) || mimeType;
               }

               if (!imageBase64) {
                  return errorResult(
                     'Provide parse_token from parse_offers_screenshot, or upload_id / image_base64 with year/coop_year/coop_cycle/program_level.'
                  );
               }
               if (
                  args.year == null ||
                  !args.coop_year ||
                  !args.coop_cycle ||
                  !args.program_level
               ) {
                  return errorResult(
                     'When re-supplying a screenshot, year, coop_year, coop_cycle, and program_level are required.'
                  );
               }

               const text = await recognizeImage(imageBase64, mimeType);
               const common: OffersCommon = {
                  year: args.year,
                  coop_year: args.coop_year,
                  coop_cycle: args.coop_cycle,
                  program_level: args.program_level,
                  coop_round: args.coop_round ?? 'A'
               };
               offers = parseOffersText(text, common);
            }

            if (!offers || offers.length === 0) {
               return errorResult(
                  'No parseable offers. A valid DrexelOne rankings/offers screenshot is required to submit salaries.'
               );
            }

            const results = await submitParsedOffers(
               getDb(),
               getMeili(),
               offers,
               args.indices
            );

            return textResult({
               submitted: results.filter(r => r.id).length,
               failed: results.filter(r => r.error).length,
               results
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );
}
