import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
   searchSections,
   searchProfessors,
   searchCompanies,
   searchSubmissions,
   type SearchMode
} from '@/lib/meili';
import { textResult, errorResult } from '@/lib/json';
import {
   withSectionLinks,
   withProfessorLinks,
   withCompanyLinks,
   withSalaryLinks,
   mapHits
} from '@/lib/enrich';

const LINK_HINT =
   ' Results include openmario_*_url fields — always cite them as markdown links in answers.';

const modeSchema = z
   .enum(['hybrid', 'keyword', 'semantic'])
   .optional()
   .default('hybrid')
   .describe(
      'hybrid (default) blends keyword + semantic; keyword is exact text; semantic is meaning-only (requires Meilisearch embedders)'
   );

const limitSchema = z
   .number()
   .int()
   .min(1)
   .max(50)
   .optional()
   .default(15)
   .describe('Max hits to return');

function buildFilter(parts: (string | undefined)[]) {
   const f = parts.filter(Boolean);
   return f.length ? f.join(' AND ') : undefined;
}

export function registerSearchTools(server: McpServer) {
   server.registerTool(
      'search_sections',
      {
         title: 'Search course sections',
         description:
            'Search Drexel course sections (schedule, instructors, credits). Prefer hybrid mode for natural-language queries like "morning CS lecture with good professor".' +
            LINK_HINT,
         inputSchema: {
            q: z.string().describe('Search query'),
            term: z.string().optional().describe('Term filter e.g. 202535'),
            subject: z.string().optional().describe('Subject code e.g. CS'),
            college: z.string().optional().describe('College name'),
            instruction_method: z.string().optional(),
            instruction_type: z.string().optional(),
            mode: modeSchema,
            limit: limitSchema
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({
         q,
         term,
         subject,
         college,
         instruction_method,
         instruction_type,
         mode,
         limit
      }) => {
         try {
            const filter = buildFilter([
               term ? `term = "${term}"` : undefined,
               subject ? `subject_id = "${subject}"` : undefined,
               college ? `college_name = "${college}"` : undefined,
               instruction_method
                  ? `instruction_method = "${instruction_method}"`
                  : undefined,
               instruction_type
                  ? `instruction_type = "${instruction_type}"`
                  : undefined
            ]);
            const result = await searchSections({
               q,
               ...(filter ? { filter } : {}),
               limit,
               mode: mode as SearchMode
            });
            return textResult({
               estimatedTotalHits: result.estimatedTotalHits,
               hits: mapHits(
                  result.hits as Record<string, unknown>[],
                  withSectionLinks
               )
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'search_professors',
      {
         title: 'Search professors',
         description:
            'Search professors by name, department, or natural language (e.g. "easy CS professor with many ratings").' +
            LINK_HINT,
         inputSchema: {
            q: z.string().describe('Search query'),
            department: z.string().optional(),
            mode: modeSchema,
            limit: limitSchema
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ q, department, mode, limit }) => {
         try {
            const filter = department
               ? `department = "${department}"`
               : undefined;
            const result = await searchProfessors({
               q,
               ...(filter ? { filter } : {}),
               limit,
               mode: mode as SearchMode
            });
            return textResult({
               estimatedTotalHits: result.estimatedTotalHits,
               hits: mapHits(
                  result.hits as Record<string, unknown>[],
                  withProfessorLinks
               )
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'search_companies',
      {
         title: 'Search companies',
         description:
            'Search co-op employers with omega scores, compensation, and review aggregates. Natural language works in hybrid mode.' +
            LINK_HINT,
         inputSchema: {
            q: z.string().describe('Search query'),
            mode: modeSchema,
            limit: limitSchema
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ q, mode, limit }) => {
         try {
            const result = await searchCompanies({
               q,
               limit,
               mode: mode as SearchMode
            });
            return textResult({
               estimatedTotalHits: result.estimatedTotalHits,
               hits: mapHits(
                  result.hits as Record<string, unknown>[],
                  withCompanyLinks
               )
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'search_salaries',
      {
         title: 'Search co-op salaries',
         description:
            'Search anonymized co-op salary submissions. Filter by year range, coop cycle/year, or program level. Each hit includes openmario_company_url, openmario_position_url, and openmario_salary_search_url — always hyperlink wages using those.' +
            LINK_HINT,
         inputSchema: {
            q: z
               .string()
               .describe('Search query (company, position, location)'),
            year_min: z.number().int().optional(),
            year_max: z.number().int().optional(),
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
            mode: modeSchema,
            limit: limitSchema
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({
         q,
         year_min,
         year_max,
         coop_year,
         coop_cycle,
         program_level,
         mode,
         limit
      }) => {
         try {
            const filter = buildFilter([
               year_min != null && year_max != null
                  ? `year >= ${year_min} AND year <= ${year_max}`
                  : year_min != null
                    ? `year >= ${year_min}`
                    : year_max != null
                      ? `year <= ${year_max}`
                      : undefined,
               coop_year ? `coop_year = "${coop_year}"` : undefined,
               coop_cycle ? `coop_cycle = "${coop_cycle}"` : undefined,
               program_level ? `program_level = "${program_level}"` : undefined
            ]);
            const result = await searchSubmissions({
               q,
               ...(filter ? { filter } : {}),
               limit,
               mode: mode as SearchMode,
               sort: ['compensation:desc']
            });
            return textResult({
               estimatedTotalHits: result.estimatedTotalHits,
               hits: mapHits(
                  result.hits as Record<string, unknown>[],
                  withSalaryLinks
               )
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );
}
