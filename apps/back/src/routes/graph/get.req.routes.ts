import { validator as zValidator } from 'hono-openapi/zod';
import { neo4jService } from '#/services/neo4j.service.ts';
import { GetReqResponseSchema, ReqParamsSchema } from '#models';
import { DescribeGraphRoute, factory } from './common.ts';

const cypher = `
    MATCH (course:Course)
    WHERE course.id = $course_id
    OPTIONAL MATCH (prereq:Course)-[prerequisiteRel:PREREQUISITE]->(course)
    OPTIONAL MATCH (course)-[coreqRel:COREQUISITE]-(coreq:Course)
    RETURN course.id AS courseId,
           course.title AS courseName,
           course.subject_id AS subjectId,
           course.course_number AS courseNumber,
           COLLECT(DISTINCT {
               id: prereq.id,
               name: prereq.title,
               subjectId: prereq.subject_id,
               courseNumber: prereq.course_number,
               relationshipType: prerequisiteRel.relationship_type,
               groupId: prerequisiteRel.group_id,
               canTakeConcurrent: prerequisiteRel.can_take_concurrent,
               minimumGrade: prerequisiteRel.minimum_grade,
               relationshipId: id(prerequisiteRel)
           }) AS prerequisites,
           COLLECT(DISTINCT {
               id: coreq.id,
               name: coreq.title,
               subjectId: coreq.subject_id,
               courseNumber: coreq.course_number
           }) AS corequisites
`;

interface CourseInfo {
   id: string;
   name: string;
   subjectId: string;
   courseNumber: string;
}

interface Prerequisite {
   id: string;
   name: string;
   subjectId: string;
   courseNumber: string;
   relationshipType: string;
   groupId: string;
   canTakeConcurrent: boolean;
   minimumGrade: string;
   relationshipId: number;
}

interface Corequisite {
   id: string;
   name: string;
   subjectId: string;
   courseNumber: string;
}

interface CourseRequirementsData {
   course: CourseInfo;
   prerequisites: Prerequisite[][];
   corequisites: Corequisite[];
}

/**
 * GET graph/req/{course_id}
 * Retrieve all prereq and coreq (with its attributes) for a specific course
 */
export default factory.createHandlers(
   DescribeGraphRoute({
      description: 'Retrieve prerequisites and corequisites for a specific course',
      responses: {
         '200': {
            description: 'Course prerequisites and corequisites data',
            schema: GetReqResponseSchema,
         },
         '404': {
            description: 'Course not found',
         },
      },
   }),
   zValidator('param', ReqParamsSchema),
   async (c) => {
      const { course_id } = c.req.valid('param');

      return await neo4jService
         .executeReadQuery(cypher, { course_id })
         .then((records) => {
            if (records.length === 0) {
               return c.json({ message: 'Course not found' }, 404);
            }

            const record = records[0];

            const courseData: CourseInfo = {
               id: record.get('courseId'),
               name: record.get('courseName'),
               subjectId: record.get('subjectId'),
               courseNumber: record.get('courseNumber'),
            };

            const prerequisites: Prerequisite[] = record
               .get('prerequisites')
               .filter((p: Prerequisite) => p.id !== null);

            const corequisites: Corequisite[] = record
               .get('corequisites')
               .filter((c: Corequisite) => c.id !== null);

            const groupedPrerequisites = Object.values(
               prerequisites.reduce(
                  (acc: Record<string, Prerequisite[]>, { groupId, ...prereq }) => {
                     if (!acc[groupId]) {
                        acc[groupId] = [];
                     }
                     acc[groupId].push({ groupId, ...prereq });
                     return acc;
                  },
                  {},
               ),
            );

            const transformedData: CourseRequirementsData = {
               course: courseData,
               prerequisites: groupedPrerequisites,
               corequisites,
            };

            return c.json({ data: transformedData }, 200);
         })
         .catch((error) => {
            console.error('Error fetching prerequisites and corequisites:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return c.json({ message: errorMessage }, 500);
         });
   },
);
