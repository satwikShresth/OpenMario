import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { textResult, errorResult } from '@/lib/json'
import { quarterScheduleUrl, courseUrl } from '@/lib/links'
import { searchSections } from '@/lib/meili'
import {
   TERMS,
   decodeQuarterScheduleLink,
   encodeQuarterSchedule,
   quarterScheduleInputSchema,
   unavailableBlockSchema,
} from '@/lib/schedule-encode'

function toDrexelTermId(term: string, year: number): string {
   const map: Record<string, string> = {
      Fall: '15',
      Winter: '25',
      Spring: '35',
      Summer: '45',
   }
   const code = map[term]
   if (!code) throw new Error(`Unknown term ${term}`)
   return `${year}${code}`
}

export function registerScheduleLinkTools(server: McpServer) {
   server.registerTool(
      'generate_quarter_schedule_link',
      {
         title: 'Generate quarter schedule setup link',
         description: `Build a clickable OpenMario Quarter Schedule URL from JSON (term + year + CRNs).

The user opens the link in the browser; sections are imported into their local schedule (IndexedDB) — MCP does not write schedules.

REQUIRED WORKFLOW:
1. get_quarter_schedule_guide (optional)
2. search_sections with term filter / query to resolve real CRNs for that quarter
3. Call this tool with term, year, crns[] (and optional unavailable blocks)
4. ALWAYS show openmario_schedule_url as a markdown link`,
         inputSchema: {
            term: z.enum(TERMS).describe('Academic term name'),
            year: z.number().int().min(2000).max(2100).describe('Calendar year for that term'),
            crns: z
               .array(z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]))
               .min(1)
               .max(40)
               .describe('Section CRNs from search_sections'),
            unavailable: z
               .array(unavailableBlockSchema)
               .max(40)
               .optional()
               .describe('Optional busy blocks (day 0=Sun…6=Sat, HH:MM local)'),
            action: z
               .enum(['add', 'replace'])
               .optional()
               .default('add')
               .describe('add merges CRNs; replace clears that term first'),
         },
         annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async input => {
         try {
            const schedule = quarterScheduleInputSchema.parse(input)
            const encoded = encodeQuarterSchedule(schedule)
            const openmario_schedule_url = quarterScheduleUrl({ scheduleEncoded: encoded })
            return textResult({
               openmario_schedule_url,
               term: schedule.term,
               year: schedule.year,
               drexel_term_id: toDrexelTermId(schedule.term, schedule.year),
               crn_count: schedule.crns.length,
               crns: schedule.crns.map(Number),
               unavailable_count: schedule.unavailable.length,
               action: schedule.action,
               tip: `Present: [Open ${schedule.term} ${schedule.year} schedule](${openmario_schedule_url})`,
            })
         } catch (e) {
            return errorResult(
               e instanceof Error ? e.message : 'Failed to encode quarter schedule link',
            )
         }
      },
   )

   server.registerTool(
      'get_quarter_schedule_from_link',
      {
         title: 'Get quarter schedule from share link',
         description:
            'Decode an OpenMario /courses/plan/schedule?schedule=… URL and enrich CRNs via Meilisearch (course, times, instructors).',
         inputSchema: {
            schedule_url: z
               .string()
               .min(8)
               .describe(
                  'Full https://openmario.com/courses/plan/schedule?schedule=… URL, or bare schedule query value',
               ),
         },
         annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async ({ schedule_url }) => {
         try {
            const { schedule, schedule_url: url } = decodeQuarterScheduleLink(schedule_url)
            const drexel_term_id = toDrexelTermId(schedule.term, schedule.year)
            const crns = schedule.crns.map(Number)
            const filterParts = [
               `term = "${drexel_term_id}"`,
               `crn IN [${crns.join(', ')}]`,
            ]
            const hits = await searchSections({
               q: '',
               filter: filterParts.join(' AND '),
               limit: Math.max(crns.length, 1),
               mode: 'keyword',
            })

            const byCrn = new Map(hits.hits.map(h => [h.crn, h]))
            const sections = crns.map(crn => {
               const hit = byCrn.get(crn)
               if (!hit) {
                  return {
                     crn,
                     found: false as const,
                  }
               }
               return {
                  crn,
                  found: true as const,
                  course: hit.course,
                  title: hit.title,
                  course_id: hit.course_id,
                  openmario_url: courseUrl(hit.course_id),
                  section: hit.section,
                  days: hit.days,
                  start_time: hit.start_time,
                  end_time: hit.end_time,
                  instruction_method: hit.instruction_method,
                  instruction_type: hit.instruction_type,
                  credits: hit.credits,
                  instructors: hit.instructors?.map(i => i.name) ?? [],
               }
            })

            const missing = sections.filter(s => !s.found).map(s => s.crn)
            const summary = sections
               .map(s =>
                  s.found
                     ? `CRN ${s.crn}: ${s.course} ${s.title} (${s.days?.join('') || 'TBA'} ${s.start_time ?? ''}–${s.end_time ?? ''})`
                     : `CRN ${s.crn}: (not found for ${schedule.term} ${schedule.year})`,
               )
               .join('\n')

            return textResult({
               openmario_schedule_url: url,
               term: schedule.term,
               year: schedule.year,
               drexel_term_id,
               action: schedule.action,
               unavailable: schedule.unavailable,
               sections,
               missing_crns: missing,
               summary,
               tip: 'Hyperlink each found section via openmario_url. Missing CRNs may be inactive-term or typo.',
            })
         } catch (e) {
            return errorResult(
               e instanceof Error ? e.message : 'Failed to decode quarter schedule link',
            )
         }
      },
   )

   server.registerTool(
      'get_quarter_schedule_guide',
      {
         title: 'Quarter schedule build guide',
         description:
            'Returns fields, enums, and MCP tools needed to build a quarter schedule JSON link (CRNs + optional unavailable blocks).',
         inputSchema: {},
         annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async () =>
         textResult({
            fields: {
               term: TERMS,
               year: 'calendar year for that term (e.g. Summer 2026 → 2026)',
               crns: 'array of section CRNs from search_sections (required)',
               unavailable:
                  'optional [{ day: 0–6 Sun–Sat, start: "HH:MM", end: "HH:MM", title? }]',
               action: ['add', 'replace'],
            },
            tools_to_use: [
               'search_sections',
               'get_course',
               'get_course_availabilities',
               'generate_quarter_schedule_link',
               'get_quarter_schedule_from_link',
            ],
            workflow: [
               'Ask which term/year the student wants',
               'search_sections with q + term context; collect real CRNs (never invent)',
               'Optionally add unavailable blocks for work/club times',
               'generate_quarter_schedule_link',
               'Show openmario_schedule_url as a markdown link — browser imports locally',
            ],
            tip: 'Prefer lecture + linked labs carefully; check time conflicts before encoding. For multi-year course placement without CRNs, use generate_plan_of_study_link instead.',
         }),
   )
}
