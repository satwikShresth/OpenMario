import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
   fetchCourse,
   fetchPrerequisites,
   fetchCorequisites,
   fetchDependents,
   fetchAvailabilities
} from '@/lib/queries';
import { textResult, errorResult } from '@/lib/json';
import { withCourseLinks } from '@/lib/enrich';
import { courseUrl, professorUrl } from '@/lib/links';

const LINK_HINT =
   ' Includes openmario_url fields — always cite courses/professors as markdown links.';

function linkRelatedCourse(row: {
   id: string;
   name?: string;
   subjectId?: string;
   courseNumber?: string;
   [key: string]: unknown;
}) {
   return {
      ...row,
      openmario_url: courseUrl(row.id)
   };
}

export function registerCourseTools(server: McpServer) {
   server.registerTool(
      'get_course',
      {
         title: 'Get course',
         description: 'Get course catalog details by course UUID.' + LINK_HINT,
         inputSchema: {
            course_id: z.uuid().describe('Course UUID')
         },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ course_id }) => {
         try {
            const course = await fetchCourse(course_id);
            return textResult(withCourseLinks(course as Record<string, unknown>));
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'get_course_prerequisites',
      {
         title: 'Get course prerequisites',
         description:
            'Get prerequisite groups (OR-sets) for a course. Use for degree planning.' +
            LINK_HINT,
         inputSchema: { course_id: z.uuid() },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ course_id }) => {
         try {
            const data = await fetchPrerequisites(course_id);
            return textResult({
               course: {
                  ...data.course,
                  openmario_url: courseUrl(data.course.id)
               },
               prerequisites: data.prerequisites.map(group =>
                  group.map(linkRelatedCourse)
               )
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'get_course_corequisites',
      {
         title: 'Get course corequisites',
         description: 'Get corequisites for a course.' + LINK_HINT,
         inputSchema: { course_id: z.uuid() },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ course_id }) => {
         try {
            const data = await fetchCorequisites(course_id);
            return textResult({
               course: {
                  ...data.course,
                  openmario_url: courseUrl(data.course.id)
               },
               corequisites: data.corequisites.map(linkRelatedCourse)
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'get_course_dependents',
      {
         title: 'Get course dependents',
         description:
            'Courses that list this course as a prerequisite (reverse lookup).' +
            LINK_HINT,
         inputSchema: { course_id: z.uuid() },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ course_id }) => {
         try {
            const data = await fetchDependents(course_id);
            return textResult({
               course: {
                  ...data.course,
                  openmario_url: courseUrl(data.course.id)
               },
               dependents: data.dependents.map(linkRelatedCourse)
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );

   server.registerTool(
      'get_course_availabilities',
      {
         title: 'Get course availabilities',
         description:
            'Historical/current section offerings with instructors and RMP stats.' +
            LINK_HINT,
         inputSchema: { course_id: z.uuid() },
         annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async ({ course_id }) => {
         try {
            const rows = await fetchAvailabilities(course_id);
            return textResult({
               course_id,
               openmario_course_url: courseUrl(course_id),
               availabilities: rows.map(row => ({
                  ...row,
                  instructor: row.instructor
                     ? {
                          ...row.instructor,
                          openmario_url: professorUrl(
                             String(row.instructor.id)
                          )
                       }
                     : null
               }))
            });
         } catch (e) {
            return errorResult(e instanceof Error ? e.message : String(e));
         }
      }
   );
}
