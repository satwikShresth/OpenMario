import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { env } from '@env';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createOpenMarioMcpServer } from './server';
import { shutdownOcr } from '@/lib/ocr';
import { pruneParseCache } from '@/lib/parse-cache';
import {
   getUploadSlot,
   pruneUploadCache,
   storeUploadBase64,
   storeUploadBytes
} from '@/lib/upload-cache';

const allowedHosts = env.MCP_ALLOWED_HOSTS.split(',')
   .map(h => h.trim())
   .filter(Boolean);

setInterval(() => {
   pruneParseCache();
   pruneUploadCache();
}, 5 * 60 * 1000);

const ALLOWED_UPLOAD_MIME = new Set([
   'image/png',
   'image/jpeg',
   'image/jpg',
   'image/webp'
]);

function normalizeMime(raw: string | undefined): string {
   const mime = (raw ?? 'image/png').split(';')[0]!.trim().toLowerCase();
   if (mime === 'image/jpg') return 'image/jpeg';
   return mime;
}

async function handleMcp(c: {
   req: { raw: Request };
}) {
   const server = createOpenMarioMcpServer();
   const transport = new WebStandardStreamableHTTPServerTransport({
      enableJsonResponse: true,
      allowedHosts,
      enableDnsRebindingProtection: env.NODE_ENV === 'production'
   });

   await server.connect(transport);

   try {
      return await transport.handleRequest(c.req.raw);
   } finally {
      await transport.close().catch(() => undefined);
      await server.close().catch(() => undefined);
   }
}

const app = new Hono({ strict: false })
   .use('*', logger())
   .use(
      '*',
      cors({
         origin: '*',
         allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allowHeaders: [
            'Content-Type',
            'Accept',
            'mcp-session-id',
            'Last-Event-ID',
            'Mcp-Protocol-Version'
         ],
         exposeHeaders: ['mcp-session-id']
      })
   )
   .get('/health', c =>
      c.json({
         status: 'ok',
         application: 'openmario-mcp',
         transport: 'streamable-http',
         endpoint: '/'
      })
   )
   .put('/uploads/:upload_id', async c => {
      const uploadId = c.req.param('upload_id');
      if (!getUploadSlot(uploadId)) {
         return c.json({ error: 'Unknown or expired upload_id' }, 404);
      }
      const mimeType = normalizeMime(c.req.header('content-type'));
      if (!ALLOWED_UPLOAD_MIME.has(mimeType)) {
         return c.json(
            {
               error: `Unsupported Content-Type "${mimeType}". Use image/png, image/jpeg, or image/webp.`
            },
            415
         );
      }
      try {
         const bytes = new Uint8Array(await c.req.arrayBuffer());
         if (bytes.byteLength === 0) {
            return c.json({ error: 'Empty body' }, 400);
         }
         storeUploadBytes(uploadId, bytes, mimeType);
         return c.json({
            ok: true,
            upload_id: uploadId,
            bytes: bytes.byteLength,
            mime_type: mimeType,
            next_step:
               'Call parse_offers_screenshot with this upload_id and coop context.'
         });
      } catch (e) {
         return c.json(
            { error: e instanceof Error ? e.message : String(e) },
            400
         );
      }
   })
   .post('/uploads/:upload_id', async c => {
      const uploadId = c.req.param('upload_id');
      if (!getUploadSlot(uploadId)) {
         return c.json({ error: 'Unknown or expired upload_id' }, 404);
      }
      try {
         const contentType = c.req.header('content-type') ?? '';
         if (contentType.includes('application/json')) {
            const body = await c.req.json<{
               image_base64?: string;
               mime_type?: string;
            }>();
            if (!body.image_base64) {
               return c.json({ error: 'image_base64 required' }, 400);
            }
            const mimeType = normalizeMime(body.mime_type ?? 'image/png');
            if (!ALLOWED_UPLOAD_MIME.has(mimeType)) {
               return c.json({ error: 'Unsupported mime_type' }, 415);
            }
            storeUploadBase64(uploadId, body.image_base64, mimeType);
            return c.json({
               ok: true,
               upload_id: uploadId,
               mime_type: mimeType,
               next_step:
                  'Call parse_offers_screenshot with this upload_id and coop context.'
            });
         }

         const mimeType = normalizeMime(contentType);
         if (!ALLOWED_UPLOAD_MIME.has(mimeType)) {
            return c.json(
               {
                  error: 'Unsupported Content-Type. Use image/* or application/json with image_base64.'
               },
               415
            );
         }
         const bytes = new Uint8Array(await c.req.arrayBuffer());
         storeUploadBytes(uploadId, bytes, mimeType);
         return c.json({
            ok: true,
            upload_id: uploadId,
            bytes: bytes.byteLength,
            mime_type: mimeType,
            next_step:
               'Call parse_offers_screenshot with this upload_id and coop context.'
         });
      } catch (e) {
         return c.json(
            { error: e instanceof Error ? e.message : String(e) },
            400
         );
      }
   })
   // Primary endpoint is the host root; /mcp kept as a compatibility alias.
   .all('/', handleMcp)
   .all('/mcp', handleMcp);

export default {
   port: env.MCP_PORT,
   fetch: app.fetch
};

console.log(
   `OpenMario MCP listening on http://localhost:${env.MCP_PORT}/ (health: /health)`
);

process.on('SIGINT', async () => {
   await shutdownOcr();
   process.exit(0);
});
