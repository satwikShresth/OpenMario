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

   server.registerPrompt(
      'build-plan-of-study',
      {
         title: 'Build plan of study link',
         description:
            'Design a multi-year Drexel plan of study and give the user a clickable OpenMario setup link.',
         argsSchema: {
            major: z.string().describe('Major or program, e.g. "Computer Science"'),
            start_fall_year: z
               .string()
               .describe('Fall start year as string, e.g. "2026"'),
            notes: z
               .string()
               .optional()
               .describe('Co-op years, constraints, or preferred electives'),
         },
      },
      ({ major, start_fall_year, notes }) => ({
         messages: [
            {
               role: 'user',
               content: {
                  type: 'text',
                  text: `Build a Plan of Study for a ${major} student starting Fall ${start_fall_year}.${notes ? ` Notes: ${notes}` : ''}

Workflow:
1. Call get_plan_of_study_guide. If the user already has a plan link, call get_plan_of_study_from_link first.
2. Use search_sections / get_course to resolve required courses to UUIDs (never invent IDs).
3. Structure years with fall_year each (Fall Y → Summer Y+1). Mark co-op / break modes.
4. Call generate_plan_of_study_link with years (course_ids only), name, action=create, set_default=true.
5. Present openmario_plan_url as a markdown link the user can click.
6. Briefly explain year-by-year; hyperlink every course via openmario_url.

${LINKING_INSTRUCTIONS}`,
               },
            },
         ],
      }),
   );

   server.registerPrompt(
      'report-salaries',
      {
         title: 'Report salaries via link',
         description:
            'Turn salary/offer JSON into a clickable OpenMario report link. One offer prefills the form; multiple offers import as drafts.',
         argsSchema: {
            offers_json: z
               .string()
               .describe(
                  'JSON array or object of salary offers (company, position, location, compensation, year, …)',
               ),
            notes: z
               .string()
               .optional()
               .describe('Extra context e.g. coop cycle or corrections'),
         },
      },
      ({ offers_json, notes }) => ({
         messages: [
            {
               role: 'user',
               content: {
                  type: 'text',
                  text: `Help me report these co-op salaries on OpenMario.

Raw data:
${offers_json}
${notes ? `\nNotes: ${notes}` : ''}

Workflow:
1. Call get_salary_form_guide for required fields/enums.
2. For each offer, resolve exact names with autocomplete_company, autocomplete_position, and autocomplete_location (do not invent).
3. Optionally check search_salaries / get_company for context.
4. Call generate_salary_report_link with the normalized offers JSON (and common defaults when shared).
5. Present openmario_salary_url as a markdown link. If multiple offers, explain they import as drafts at /salary/drafts.
6. Never claim you submitted salaries server-side — the user must confirm in the browser.

${LINKING_INSTRUCTIONS}`,
               },
            },
         ],
      }),
   );

   server.registerPrompt(
      'build-quarter-schedule',
      {
         title: 'Build quarter schedule link',
         description:
            'Find sections for a term and give the user a clickable OpenMario quarter schedule setup link (CRNs).',
         argsSchema: {
            term: z
               .string()
               .describe('Term name: Fall | Winter | Spring | Summer'),
            year: z.string().describe('Calendar year e.g. "2026"'),
            courses: z
               .string()
               .describe(
                  'Comma-separated course codes or titles to schedule e.g. "CS 260, MATH 221"',
               ),
            notes: z
               .string()
               .optional()
               .describe('Constraints e.g. morning only, avoid Fridays, lab preference'),
         },
      },
      ({ term, year, courses, notes }) => ({
         messages: [
            {
               role: 'user',
               content: {
                  type: 'text',
                  text: `Build a Quarter Schedule for ${term} ${year} covering: ${courses}.${notes ? ` Notes: ${notes}` : ''}

Workflow:
1. Call get_quarter_schedule_guide.
2. For each course, search_sections (filter/select the correct term) and pick CRNs that don't conflict.
3. Optionally add unavailable blocks for work/clubs.
4. Call generate_quarter_schedule_link with { term, year, crns, unavailable?, action: "add"|"replace" }.
5. Present openmario_schedule_url as a markdown link. Explain sections briefly; hyperlink courses via openmario_url.
6. Never invent CRNs. Prefer get_quarter_schedule_from_link if the user already has a schedule URL.

${LINKING_INSTRUCTIONS}`,
               },
            },
         ],
      }),
   );
}
