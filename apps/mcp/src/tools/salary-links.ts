import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { textResult, errorResult } from '@/lib/json'
import {
   buildSalaryReportLink,
   salaryReportCommonSchema,
   salaryOfferBuildInputSchema,
   COOP_CYCLE,
   COOP_YEAR,
   PROGRAM_LEVEL,
} from '@/lib/salary-report-link'
import { decodeSalaryReportLink } from '@/lib/salary-encode'

const REPORT_LINK_HTTP = 'https://mcp.openmario.com/api/salary/report-link'

export function registerSalaryLinkTools(server: McpServer) {
   server.registerTool(
      'generate_salary_report_link',
      {
         title: 'Generate salary report link(s)',
         description: `Build a clickable OpenMario salary report URL from JSON offers.

Browser behavior (no silent MCP write):
• 1 offer → opens Report Salary with the form prefilled
• 2+ offers → all saved as local drafts; user reviews at /salary/drafts

REQUIRED WORKFLOW before calling:
1. autocomplete_company / search_companies → exact company name
2. autocomplete_position (with company) → exact position name
3. autocomplete_location → "City, ST"
4. Fill enums: coop_year, coop_cycle, program_level
5. Call this tool with the JSON offers array

Note: the browser form resolves IDs via Meilisearch; the link only carries names. Users may still need to pick/add entities if names do not match.

ALWAYS present openmario_salary_url as a markdown link.

HTTP equivalent (no MCP): POST ${REPORT_LINK_HTTP}`,
         inputSchema: {
            offers: z
               .array(salaryOfferBuildInputSchema)
               .min(1)
               .max(50)
               .describe('One or more salary reports matching the manual form fields'),
            common: salaryReportCommonSchema
               .optional()
               .describe('Defaults applied to every offer when a field is omitted'),
            start_index: z
               .number()
               .int()
               .min(0)
               .optional()
               .describe('Optional idx query param (legacy; multi-offer links import all drafts)'),
         },
         annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async input => {
         try {
            return textResult(buildSalaryReportLink(input))
         } catch (e) {
            return errorResult(
               e instanceof Error ? e.message : 'Failed to encode salary report link',
            )
         }
      },
   )

   server.registerTool(
      'get_salaries_from_link',
      {
         title: 'Get salaries from share link',
         description:
            'Decode an OpenMario /salary/report?salaries=… URL (or bare payload) into structured offers for context before editing.',
         inputSchema: {
            salary_url: z
               .string()
               .min(8)
               .describe(
                  'Full https://openmario.com/salary/report?salaries=… URL, or the bare salaries query value',
               ),
         },
         annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async ({ salary_url }) => {
         try {
            const decoded = decodeSalaryReportLink(salary_url)
            return textResult({
               openmario_salary_url: salary_url.startsWith('http') ? salary_url : null,
               idx: decoded.idx ?? 0,
               offer_count: decoded.offers.length,
               offers: decoded.offers,
               tip: 'Edit offers, then regenerate with generate_salary_report_link.',
            })
         } catch (e) {
            return errorResult(
               e instanceof Error ? e.message : 'Failed to decode salary report link',
            )
         }
      },
   )

   server.registerTool(
      'get_salary_form_guide',
      {
         title: 'Salary form fill guide',
         description:
            'Returns the exact fields, enums, and MCP tools needed to properly build salary report JSON and generate_salary_report_link.',
         inputSchema: {},
         annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async () =>
         textResult({
            fields: {
               company: 'string 3–100 (must exist or be creatable in UI)',
               position: 'string 3–100',
               location: '"City, ST" from autocomplete_location',
               work_hours: 'int 5–60 (default 40)',
               compensation: 'number ≥ 0, hourly USD',
               other_compensation: 'string ≤255 optional',
               details: 'string ≤255 optional',
               year: 'int ≥2005',
               coop_year: COOP_YEAR,
               coop_cycle: COOP_CYCLE,
               program_level: PROGRAM_LEVEL,
            },
            tools_to_use: [
               'autocomplete_company',
               'autocomplete_position',
               'autocomplete_location',
               'search_companies',
               'search_salaries',
               'get_company',
               'generate_salary_report_link',
               'get_salaries_from_link',
            ],
            workflow: [
               'Resolve company/position/location via autocomplete_* (do not invent names)',
               'Build offers JSON matching fields above',
               `Call generate_salary_report_link OR POST ${REPORT_LINK_HTTP}`,
               'Show openmario_salary_url as a markdown link',
               '1 offer → prefilled report form; 2+ offers → drafts at /salary/drafts',
            ],
            tip: `Never invent company/position/location strings. Prefer exact names from autocomplete. Without MCP, POST offer JSON to ${REPORT_LINK_HTTP}.`,
            http_fallback: {
               method: 'POST',
               url: REPORT_LINK_HTTP,
               body: '{ "offers": [ … ], "common"?: { year, coop_year, coop_cycle, program_level, work_hours } }',
            },
         }),
   )

   server.registerTool(
      'get_plan_of_study_guide',
      {
         title: 'Plan of study build guide',
         description:
            'Returns the structure, enums, and MCP tools needed to properly build a plan of study and generate_plan_of_study_link.',
         inputSchema: {},
         annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async () =>
         textResult({
            structure: {
               years: [
                  {
                     fall_year: 'calendar year for Fall of that row',
                     quarters: [
                        {
                           mode: ['courses', 'break', 'coop'],
                           course_ids: ['catalog UUIDs only — never invent'],
                        },
                     ],
                  },
               ],
               notes: [
                  'Quarters are Fall, Winter, Spring, Summer in order',
                  'Co-op mode can still include up to a few course IDs',
                  'Break mode clears courses',
               ],
            },
            tools_to_use: [
               'search_sections',
               'get_course',
               'get_course_prerequisites',
               'get_course_corequisites',
               'get_course_dependents',
               'get_course_availabilities',
               'generate_plan_of_study_link',
               'get_plan_of_study_from_link',
            ],
            workflow: [
               'If user pastes a plan link → get_plan_of_study_from_link',
               'Resolve course codes → UUIDs via search_sections / get_course',
               'Call generate_plan_of_study_link with years JSON',
               'Show openmario_plan_url as a markdown link',
            ],
            tip: 'Always resolve real course UUIDs before encoding. Hyperlink every course via openmario_url.',
         }),
   )
}
