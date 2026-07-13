import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { inArray } from 'drizzle-orm'
import { course } from '@openmario/db'
import { textResult, errorResult } from '@/lib/json'
import { planOfStudyUrl, courseUrl } from '@/lib/links'
import {
   decodePlanOfStudyLink,
   encodeCompactPlan,
} from '@/lib/plan-encode'
import { getDb } from '@/lib/db'

const quarterSchema = z.object({
   mode: z
      .enum(['courses', 'break', 'coop'])
      .optional()
      .default('courses')
      .describe('Quarter mode. Co-op reserves 16 credits with 4 left for courses.'),
   course_ids: z
      .array(z.string().uuid())
      .default([])
      .describe('Catalog course UUIDs only (from search_sections / get_course).'),
})

const yearSchema = z.object({
   fall_year: z
      .number()
      .int()
      .min(2000)
      .max(2100)
      .optional()
      .describe('Fall calendar year for this row (Fall Y … Summer Y+1). Defaults to start_fall_year + index.'),
   quarters: z
      .array(quarterSchema)
      .min(1)
      .max(4)
      .describe('Fall, Winter, Spring, Summer in order.'),
})

export function registerPlanTools(server: McpServer) {
   server.registerTool(
      'generate_plan_of_study_link',
      {
         title: 'Generate plan of study setup link',
         description: `Build a clickable OpenMario Plan of Study URL (compact zipson: Fall years + modes + course UUIDs).

Query params: action=create|update|replace, name, id, default=1

ALWAYS return the URL as a markdown link. Resolve course codes → UUIDs first.`,
         inputSchema: {
            start_fall_year: z
               .number()
               .int()
               .min(2000)
               .max(2100)
               .optional()
               .describe('Fallback Fall year for rows that omit fall_year'),
            years: z
               .array(yearSchema)
               .min(1)
               .max(12)
               .describe('Academic years; each optionally sets fall_year'),
            name: z.string().optional().describe('Plan display name'),
            action: z
               .enum(['create', 'update', 'replace'])
               .optional()
               .default('create'),
            plan_id: z.string().uuid().optional(),
            set_default: z.boolean().optional().default(true),
         },
         annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async input => {
         try {
            if (!input.start_fall_year && input.years.some(y => y.fall_year == null)) {
               return errorResult(
                  'Provide start_fall_year or fall_year on every year',
               )
            }
            const encoded = encodeCompactPlan({
               ...(input.start_fall_year != null
                  ? { start_fall_year: input.start_fall_year }
                  : {}),
               years: input.years.map(y => ({
                  quarters: y.quarters,
                  ...(y.fall_year != null ? { fall_year: y.fall_year } : {}),
               })),
            })
            const openmario_plan_url = planOfStudyUrl({
               planEncoded: encoded,
               action: input.action ?? 'create',
               ...(input.name ? { name: input.name } : {}),
               ...(input.plan_id ? { id: input.plan_id } : {}),
               setDefault: input.set_default ?? true,
            })
            return textResult({
               openmario_plan_url,
               action: input.action ?? 'create',
               name: input.name ?? null,
               plan_id: input.plan_id ?? null,
               set_default: input.set_default ?? true,
               tip: `Present this to the user as: [Open plan of study](${openmario_plan_url})`,
            })
         } catch (e) {
            return errorResult(
               e instanceof Error ? e.message : 'Failed to encode plan of study link',
            )
         }
      },
   )

   server.registerTool(
      'get_plan_of_study_from_link',
      {
         title: 'Get plan of study from share link',
         description: `Decode an OpenMario Plan of Study URL (or bare ?plan= payload) into structured context: years, Fall→Summer quarters, modes, and course UUIDs with titles.

Use when the user pastes a plan link / "Copy for AI" link so you understand their current plan before editing or advising.`,
         inputSchema: {
            plan_url: z
               .string()
               .min(8)
               .describe(
                  'Full https://openmario.com/courses/plan?plan=… URL, or the bare zipson plan query value',
               ),
         },
         annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async ({ plan_url }) => {
         try {
            const decoded = decodePlanOfStudyLink(plan_url)
            const db = getDb()
            const courseMap = new Map<
               string,
               { code: string; title: string; credits: number | null; openmario_url: string }
            >()

            if (decoded.course_ids.length > 0) {
               const rows = await db
                  .select({
                     id: course.id,
                     subject_id: course.subject_id,
                     course_number: course.course_number,
                     title: course.title,
                     credits: course.credits,
                  })
                  .from(course)
                  .where(inArray(course.id, decoded.course_ids))

               for (const row of rows) {
                  courseMap.set(row.id, {
                     code: `${row.subject_id} ${row.course_number}`,
                     title: row.title,
                     credits: row.credits != null ? Number(row.credits) : null,
                     openmario_url: courseUrl(row.id),
                  })
               }
            }

            const years = decoded.years.map(y => ({
               ...y,
               quarters: y.quarters.map(q => ({
                  ...q,
                  courses: q.course_ids.map(id => ({
                     course_id: id,
                     ...(courseMap.get(id) ?? {
                        code: id.slice(0, 8),
                        title: '(unknown)',
                        credits: null,
                        openmario_url: courseUrl(id),
                     }),
                  })),
               })),
            }))

            const summary = years
               .map(y => {
                  const parts = y.quarters.map(q => {
                     if (q.mode === 'break') return `${q.term}: Break`
                     if (q.mode === 'coop') {
                        const codes = q.courses.map(c => c.code).join(', ') || 'no courses'
                        return `${q.term}: Co-op (${codes})`
                     }
                     const codes = q.courses.map(c => c.code).join(', ') || 'empty'
                     return `${q.term}: ${codes}`
                  })
                  return `${y.range}: ${parts.join(' · ')}`
               })
               .join('\n')

            return textResult({
               openmario_plan_url: plan_url.startsWith('http') ? plan_url : null,
               action: decoded.action ?? null,
               name: decoded.name ?? null,
               plan_id: decoded.plan_id ?? null,
               set_default: decoded.set_default ?? null,
               years,
               course_ids: decoded.course_ids,
               summary,
               tip: 'Use this context when advising; hyperlink each course via openmario_url.',
            })
         } catch (e) {
            return errorResult(
               e instanceof Error ? e.message : 'Failed to decode plan of study link',
            )
         }
      },
   )
}
