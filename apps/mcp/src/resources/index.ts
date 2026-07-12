import {
   McpServer,
   ResourceTemplate
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { fetchCourse, fetchProfessor, fetchCompany } from '@/lib/queries';

const OVERVIEW = `# OpenMario data overview

OpenMario helps Drexel students explore co-op salaries, employer reviews (ESAP), courses, sections, and professors.

## Domains
- **Sections / courses**: catalog + schedule search via search_sections; detail via get_course*
- **Professors**: RMP-derived ratings via search_professors / get_professor*
- **Companies / positions**: omega scores and aggregates via search_companies / get_company*
- **Reviews**: get_company_reviews / get_position_reviews
- **Salaries**: search_salaries (read); submit via request_offers_upload → parse_offers_screenshot → submit_salaries_from_offers (screenshot bytes required; no free-form invent)

## Search
search_* tools default to Meilisearch hybrid mode (keyword + semantic when embedders are configured).

## Writes
Only salary submission is writable, and only with a DrexelOne rankings/offers screenshot that OCR can parse.

## Linking (required in EVERY answer — not prompt-specific)
Tool results include \`openmario_url\` / \`openmario_*_url\` fields. Always cite them as markdown links.
- Course (UUID): https://openmario.com/courses/explore/{course_id}
- Professor (integer id): https://openmario.com/professors/{professor_id}
- Company (UUID): https://openmario.com/companies/{company_id}
- Position (UUIDs): https://openmario.com/companies/{company_id}/{position_id}
- Salary: https://openmario.com/salary?search={query} (also link company + position when citing a wage)
Never invent IDs. Never leave course codes, professors, companies, positions, or dollar amounts unlinked.
`;

const ENUMS = `# Enums & filters

coop_year: 1st | 2nd | 3rd
coop_cycle: Fall/Winter | Winter/Spring | Spring/Summer | Summer/Fall
program_level: Undergraduate | Graduate
review sort: year_desc | rating_desc | rating_asc
search mode: hybrid | keyword | semantic
`;

export function registerResources(server: McpServer) {
   server.registerResource(
      'overview',
      'openmario://docs/overview',
      {
         title: 'OpenMario data overview',
         description: 'What data OpenMario exposes and how to use tools',
         mimeType: 'text/markdown'
      },
      async uri => ({
         contents: [
            { uri: uri.href, mimeType: 'text/markdown', text: OVERVIEW }
         ]
      })
   );

   server.registerResource(
      'enums',
      'openmario://docs/enums',
      {
         title: 'OpenMario enums',
         description: 'Valid enum values for filters and salary context',
         mimeType: 'text/markdown'
      },
      async uri => ({
         contents: [{ uri: uri.href, mimeType: 'text/markdown', text: ENUMS }]
      })
   );

   server.registerResource(
      'course',
      new ResourceTemplate('openmario://course/{course_id}', {
         list: undefined
      }),
      {
         title: 'Course detail',
         description: 'Course catalog record by UUID',
         mimeType: 'application/json'
      },
      async (uri, { course_id }) => {
         const id = String(course_id);
         const data = await fetchCourse(id);
         return {
            contents: [
               {
                  uri: uri.href,
                  mimeType: 'application/json',
                  text: JSON.stringify(data, null, 2)
               }
            ]
         };
      }
   );

   server.registerResource(
      'professor',
      new ResourceTemplate('openmario://professor/{professor_id}', {
         list: undefined
      }),
      {
         title: 'Professor detail',
         description: 'Professor profile by integer id',
         mimeType: 'application/json'
      },
      async (uri, { professor_id }) => {
         const data = await fetchProfessor(String(professor_id));
         return {
            contents: [
               {
                  uri: uri.href,
                  mimeType: 'application/json',
                  text: JSON.stringify(data, null, 2)
               }
            ]
         };
      }
   );

   server.registerResource(
      'company',
      new ResourceTemplate('openmario://company/{company_id}', {
         list: undefined
      }),
      {
         title: 'Company detail',
         description: 'Company ESAP aggregates + positions by UUID',
         mimeType: 'application/json'
      },
      async (uri, { company_id }) => {
         const data = await fetchCompany(String(company_id));
         return {
            contents: [
               {
                  uri: uri.href,
                  mimeType: 'application/json',
                  text: JSON.stringify(data, null, 2)
               }
            ]
         };
      }
   );
}
