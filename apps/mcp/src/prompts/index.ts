import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { LINKING_INSTRUCTIONS } from '@/lib/links';

export function registerPrompts(server: McpServer) {
   server.registerPrompt(
      'compare-companies',
      {
         title: 'Compare companies',
         description:
            'Compare co-op employers using search, company detail, reviews, and salaries. Always hyperlink companies, positions, and wages.',
         argsSchema: {
            companies: z
               .string()
               .describe('Comma-separated company names to compare')
         }
      },
      ({ companies }) => ({
         messages: [
            {
               role: 'user',
               content: {
                  type: 'text',
                  text: `Compare these co-op companies: ${companies}.

Workflow:
1. Use search_companies for each name to get company_id and aggregate scores.
2. Use get_company for omega score, compensation, and top positions (note each position_id / openmario_url).
3. Use get_company_reviews for qualitative highlights.
4. Use search_salaries for wage distributions (use openmario_salary_search_url / position URLs for $ amounts).
5. Summarize tradeoffs (pay vs culture vs recommend %).

${LINKING_INSTRUCTIONS}`
               }
            }
         ]
      })
   );

   server.registerPrompt(
      'plan-course-path',
      {
         title: 'Plan course path',
         description:
            'Map prerequisites, dependents, and section/professor options. Always hyperlink courses and professors.',
         argsSchema: {
            course_query: z
               .string()
               .describe(
                  'Course code or title e.g. "CS 260" or "Data Structures"'
               )
         }
      },
      ({ course_query }) => ({
         messages: [
            {
               role: 'user',
               content: {
                  type: 'text',
                  text: `Help me plan around: ${course_query}.

Workflow:
1. search_sections to find the course_id / openmario_url.
2. get_course for catalog details.
3. get_course_prerequisites and get_course_dependents for the graph.
4. get_course_availabilities for instructor history.
5. For interesting instructors, get_professor.
6. Recommend a path and section choices.

${LINKING_INSTRUCTIONS}`
               }
            }
         ]
      })
   );

   server.registerPrompt(
      'submit-salary-from-screenshot',
      {
         title: 'Submit salary from screenshot',
         description:
            'Guide salary submission that REQUIRES a DrexelOne offers/rankings screenshot.',
         argsSchema: {
            year: z.string().describe('Calendar year e.g. 2026'),
            coop_year: z.string().describe('1st | 2nd | 3rd'),
            coop_cycle: z
               .string()
               .describe(
                  'Fall/Winter | Winter/Spring | Spring/Summer | Summer/Fall'
               ),
            program_level: z.string().describe('Undergraduate | Graduate')
         }
      },
      ({ year, coop_year, coop_cycle, program_level }) => ({
         messages: [
            {
               role: 'user',
               content: {
                  type: 'text',
                  text: `I want to submit co-op salaries from my DrexelOne rankings/offers screenshot.

Context: year=${year}, coop_year=${coop_year}, coop_cycle=${coop_cycle}, program_level=${program_level}.

Workflow:
1. Ask me for the DrexelOne rankings/offers screenshot if I have not attached it.
2. Prefer request_offers_upload, then upload the real image bytes to upload_url (curl / sandbox). Do NOT invent base64 from vision — chat attachments are not reliably re-encoded into tool args on Claude.ai.
3. Call parse_offers_screenshot with upload_id (or real image_base64 from a local file in Cursor/Claude Code) + the coop context above.
4. Show me the parsed offers and ask which indices to submit.
5. Call submit_salaries_from_offers with the parse_token (and indices).
6. Never invent or manually create salaries without a successful screenshot parse.
7. When summarizing submitted rows, hyperlink any resolved company/position/salary URLs.

${LINKING_INSTRUCTIONS}`
               }
            }
         ]
      })
   );

   server.registerPrompt(
      'find-coop-by-budget',
      {
         title: 'Find co-op by budget',
         description:
            'Find co-ops matching a pay target. Always hyperlink companies, positions, and wages.',
         argsSchema: {
            target_hourly: z.string().describe('Target hourly wage e.g. 30'),
            keywords: z
               .string()
               .optional()
               .describe('Optional role/industry keywords')
         }
      },
      ({ target_hourly, keywords }) => ({
         messages: [
            {
               role: 'user',
               content: {
                  type: 'text',
                  text: `Find co-op options around $${target_hourly}/hr${keywords ? ` related to: ${keywords}` : ''}.

Workflow:
1. search_salaries with relevant query (use openmario_company_url, openmario_position_url, openmario_salary_search_url on each hit).
2. search_companies / get_company for top employers.
3. get_company_reviews for culture signals.
4. Recommend a shortlist with pay vs recommend % tradeoffs.

${LINKING_INSTRUCTIONS}`
               }
            }
         ]
      })
   );

   server.registerPrompt(
      'career-elective-advice',
      {
         title: 'Career & elective advice',
         description:
            'Map a career goal to courses, companies, positions, and salaries — always hyperlinked.',
         argsSchema: {
            major: z.string().describe('Student major e.g. Finance'),
            career_goal: z
               .string()
               .describe('Target role e.g. bank auditor'),
            elective_slots: z
               .string()
               .optional()
               .describe('How many electives they can take e.g. 4')
         }
      },
      ({ major, career_goal, elective_slots }) => ({
         messages: [
            {
               role: 'user',
               content: {
                  type: 'text',
                  text: `I'm a ${major} student aiming for: ${career_goal}. I have room for ${elective_slots ?? 'a few'} electives.

Workflow:
1. search_sections / get_course for electives (use openmario_url).
2. search_companies + get_company for matching employers/positions.
3. search_salaries for pay context (link wages via openmario_salary_search_url / position URLs).
4. Explain skills, then recommend electives and co-op targets.

${LINKING_INSTRUCTIONS}`
               }
            }
         ]
      })
   );
}
