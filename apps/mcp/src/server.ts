import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSearchTools } from '@/tools/search';
import { registerCourseTools } from '@/tools/courses';
import { registerProfessorTools } from '@/tools/professors';
import { registerCompanyTools } from '@/tools/companies';
import { registerAutocompleteTools } from '@/tools/autocomplete';
import { registerPlanTools } from '@/tools/plan';
import { registerSalaryLinkTools } from '@/tools/salary-links';
import { registerScheduleLinkTools } from '@/tools/schedule-links';
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
         instructions: `OpenMario MCP — Drexel co-op salaries, employer reviews, courses, sections, professors, Plan of Study links, Quarter Schedule links, and salary-report links.

Use search_* (hybrid by default) to discover IDs/CRNs, then get_* for detail.
Read openmario://docs/overview for domain guidance.
Call get_*_guide tools when building JSON for shareable links.

Plan of Study (multi-year course placement — catalog UUIDs, not CRNs):
1. get_plan_of_study_guide (or get_plan_of_study_from_link if user pasted a link)
2. Resolve course codes → UUIDs via search_sections / course tools
3. generate_plan_of_study_link with years JSON (fall_year + quarter modes + course_ids)
4. ALWAYS show openmario_plan_url as a clickable markdown link

Quarter Schedule (one term — section CRNs + weekly calendar):
1. get_quarter_schedule_guide (or get_quarter_schedule_from_link if user pasted a link)
2. search_sections for the target term; collect real CRNs
3. generate_quarter_schedule_link with { term, year, crns, unavailable?, action? }
4. ALWAYS show openmario_schedule_url as a clickable markdown link
5. Browser imports into local IndexedDB schedule (MCP does not write)

Salary reports (read-only on MCP — user submits in browser):
1. get_salary_form_guide
2. Resolve names via autocomplete_company / autocomplete_position / autocomplete_location
3. generate_salary_report_link with offers JSON
4. ALWAYS show openmario_salary_url as a clickable markdown link
5. Browser: 1 offer prefills the form; 2+ offers import as drafts at /salary/drafts

CRITICAL — On EVERY answer, hyperlink courses, professors, companies, positions, salaries, plan links, schedule links, AND salary-report links using the openmario_*_url fields returned by tools:
- Course (UUID): https://openmario.com/courses/explore/{course_id}
- Professor (integer id): https://openmario.com/professors/{professor_id}
- Company (UUID): https://openmario.com/companies/{company_id}
- Position (UUIDs): https://openmario.com/companies/{company_id}/{position_id}
- Salary browse: https://openmario.com/salary?search={urlencoded query}
- Plan of Study: openmario_plan_url from generate_plan_of_study_link
- Quarter Schedule: openmario_schedule_url from generate_quarter_schedule_link
- Salary report: openmario_salary_url from generate_salary_report_link
When citing a wage, link company + position + the $ amount. Never leave those entities as plain text.`
      }
   );

   registerSearchTools(server);
   registerCourseTools(server);
   registerProfessorTools(server);
   registerCompanyTools(server);
   registerAutocompleteTools(server);
   registerPlanTools(server);
   registerScheduleLinkTools(server);
   registerSalaryLinkTools(server);
   registerResources(server);
   registerPrompts(server);

   return server;
}
