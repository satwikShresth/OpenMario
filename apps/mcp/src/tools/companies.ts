import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
   fetchCompany,
   fetchCompanyReviews,
   fetchPositionReviews
} from '@/lib/queries';
import { textResult, errorResult } from '@/lib/json';
import { withPositionLinks } from '@/lib/enrich';
import { companyUrl, positionUrl, salarySearchUrl } from '@/lib/links';

const LINK_HINT =
   ' Includes openmario_*_url fields — always cite companies, positions, and wages as markdown links.';

const reviewSort = z
   .enum(['year_desc', 'rating_desc', 'rating_asc'])
   .optional()
   .default('year_desc');

export function registerCompanyTools(server: McpServer) {
   server.registerTool(
      'get_company',
      {
         title: 'Get company',
         description:
            'Company ESAP aggregates (omega score, compensation, recommend %) plus all positions.' +
            LINK_HINT,
         inputSchema: {
            company_id: z.uuid().describe('Company UUID')
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ company_id }) => {
         try {
            const data = await fetchCompany(company_id);
            return textResult({
               company: {
                  ...data.company,
                  openmario_url: companyUrl(company_id),
                  openmario_salary_search_url: salarySearchUrl(
                     String(data.company.company_name ?? '')
                  )
               },
               positions: data.positions.map(p =>
                  withPositionLinks(
                     p as Record<string, unknown>,
                     company_id
                  )
               )
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'get_company_reviews',
      {
         title: 'Get company reviews',
         description:
            'Paginated position reviews across all positions at a company.' +
            LINK_HINT,
         inputSchema: {
            company_id: z.uuid(),
            sort: reviewSort,
            pageIndex: z.number().int().min(1).optional().default(1),
            pageSize: z.number().int().min(1).max(50).optional().default(10)
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ company_id, sort, pageIndex, pageSize }) => {
         try {
            const data = await fetchCompanyReviews(company_id, {
               sort,
               pageIndex,
               pageSize
            });
            return textResult({
               ...data,
               openmario_company_url: companyUrl(company_id),
               data: data.data.map(review => ({
                  ...review,
                  openmario_company_url: companyUrl(company_id),
                  openmario_position_url: positionUrl(
                     company_id,
                     review.position_id
                  )
               }))
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'get_position_reviews',
      {
         title: 'Get position reviews',
         description:
            'Paginated reviews for a specific company position.' + LINK_HINT,
         inputSchema: {
            company_id: z.uuid(),
            position_id: z.uuid(),
            sort: reviewSort,
            pageIndex: z.number().int().min(1).optional().default(1),
            pageSize: z.number().int().min(1).max(50).optional().default(10)
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ company_id, position_id, sort, pageIndex, pageSize }) => {
         try {
            const data = await fetchPositionReviews(company_id, position_id, {
               sort,
               pageIndex,
               pageSize
            });
            return textResult({
               ...data,
               openmario_company_url: companyUrl(company_id),
               openmario_position_url: positionUrl(company_id, position_id),
               data: data.data.map(review => ({
                  ...review,
                  openmario_company_url: companyUrl(company_id),
                  openmario_position_url: positionUrl(
                     company_id,
                     review.position_id
                  )
               }))
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );
}
