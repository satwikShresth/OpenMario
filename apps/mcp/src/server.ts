import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSearchTools } from '@/tools/search';
import { registerCourseTools } from '@/tools/courses';
import { registerProfessorTools } from '@/tools/professors';
import { registerCompanyTools } from '@/tools/companies';
import { registerAutocompleteTools } from '@/tools/autocomplete';
import { registerSalaryTools } from '@/tools/salary';
import { registerResources } from '@/resources/index';
import { registerPrompts } from '@/prompts/index';

export function createOpenMarioMcpServer(): McpServer {
   const server = new McpServer(
      {
         name: 'openmario',
         version: '1.0.0'
      },
      {
         capabilities: {
            logging: {},
            tools: {},
            resources: {},
            prompts: {}
         },
         instructions: `OpenMario MCP — Drexel co-op salaries, employer reviews, courses, sections, and professors.

Use search_* (hybrid by default) to discover IDs, then get_* for detail.
Read openmario://docs/overview for domain guidance.

Salary writes (screenshot required):
1. request_offers_upload → PUT/POST real image bytes to upload_url (preferred on Claude.ai)
2. parse_offers_screenshot with upload_id + coop context (or real image_base64 from a local file in Cursor/Claude Code)
3. submit_salaries_from_offers with parse_token
Never invent base64 or salaries from vision alone — chat attachments are not reliably re-encoded into tool args on Claude.ai. Screenshot bytes must reach the server for OCR.

CRITICAL — On EVERY answer, hyperlink courses, professors, companies, positions, AND salaries using the openmario_*_url fields returned by tools:
- Course (UUID): https://openmario.com/courses/explore/{course_id}
- Professor (integer id): https://openmario.com/professors/{professor_id}
- Company (UUID): https://openmario.com/companies/{company_id}
- Position (UUIDs): https://openmario.com/companies/{company_id}/{position_id}
- Salary browse: https://openmario.com/salary?search={urlencoded query}
When citing a wage, link company + position + the $ amount (use openmario_salary_search_url or the position URL). Never leave those entities as plain text.`
      }
   );

   registerSearchTools(server);
   registerCourseTools(server);
   registerProfessorTools(server);
   registerCompanyTools(server);
   registerAutocompleteTools(server);
   registerSalaryTools(server);
   registerResources(server);
   registerPrompts(server);

   return server;
}
