import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
   autocompleteCompany,
   autocompletePosition,
   autocompleteLocation
} from '@/lib/queries';
import { textResult, errorResult } from '@/lib/json';
import {
   withCompanyLinks,
   withPositionLinks,
   withSalaryLinks
} from '@/lib/enrich';

export function registerAutocompleteTools(server: McpServer) {
   server.registerTool(
      'autocomplete_company',
      {
         title: 'Autocomplete company',
         description:
            'Fuzzy company name lookup. Prefer 3+ characters. Results include openmario_url.',
         inputSchema: {
            comp: z.string().min(2).describe('Company name fragment')
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ comp }) => {
         try {
            const rows = await autocompleteCompany(comp);
            return textResult(
               rows.map(r => withCompanyLinks(r as Record<string, unknown>))
            );
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'autocomplete_position',
      {
         title: 'Autocomplete position',
         description:
            'Fuzzy position lookup. Pass company name or "*" for any company. Results include openmario_*_url fields.',
         inputSchema: {
            comp: z.string().describe('Exact company name or "*"'),
            pos: z.string().min(2).describe('Position name fragment')
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ comp, pos }) => {
         try {
            const rows = await autocompletePosition(comp, pos);
            return textResult(
               rows.map(r =>
                  withSalaryLinks(
                     withPositionLinks(
                        r as Record<string, unknown>,
                        r.company_id
                     )
                  )
               )
            );
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'autocomplete_location',
      {
         title: 'Autocomplete location',
         description: 'Fuzzy city/state lookup. Returns "City, ST" names.',
         inputSchema: {
            loc: z.string().min(2).describe('Location fragment')
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ loc }) => {
         try {
            return textResult(await autocompleteLocation(loc));
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );
}
