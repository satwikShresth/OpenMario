import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { fetchProfessor, fetchProfessorSections } from '@/lib/queries';
import { textResult, errorResult } from '@/lib/json';
import { withProfessorLinks, withCourseLinks } from '@/lib/enrich';
import { professorUrl } from '@/lib/links';

const LINK_HINT =
   ' Includes openmario_url fields — always cite professors/courses as markdown links.';

const professorIdSchema = z.coerce
   .number()
   .int()
   .positive()
   .describe('Professor / instructor integer id (not a UUID)');

export function registerProfessorTools(server: McpServer) {
   server.registerTool(
      'get_professor',
      {
         title: 'Get professor',
         description:
            'Full professor profile including RMP aggregates, subjects, and courses taught.' +
            LINK_HINT,
         inputSchema: {
            professor_id: professorIdSchema
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ professor_id }) => {
         try {
            const row = await fetchProfessor(professor_id);
            return textResult(
               withProfessorLinks(row as Record<string, unknown>)
            );
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'get_professor_sections',
      {
         title: 'Get professor sections',
         description:
            'All sections taught by a professor across terms.' + LINK_HINT,
         inputSchema: { professor_id: professorIdSchema },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ professor_id }) => {
         try {
            const rows = await fetchProfessorSections(professor_id);
            return textResult({
               professor_id,
               openmario_professor_url: professorUrl(professor_id),
               sections: rows.map(row =>
                  withCourseLinks(row as Record<string, unknown>)
               )
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );
}
