import { validator as zValidator } from 'hono-openapi/zod';
import { neo4jService } from '#/services/neo4j.service.ts';
import { GetCourseAvailabilitiesResponseSchema, ReqParamsSchema } from '#models';
import { DescribeGraphRoute, factory } from './common.ts';

const cypher = `
    MATCH (course:Course)
    WHERE course.id = $course_id
    MATCH (course)-[offers:OFFERS]->(section:Section)-[:OFFERED_ON]->(term:Term)
    OPTIONAL MATCH (instructor:Instructor)-[:TEACHES]->(section)
    WHERE offers IS NULL OR offers.instruction_type = 'Lecture'
    WITH course, 
         COLLECT(DISTINCT CASE 
           WHEN section IS NOT NULL AND term IS NOT NULL THEN {
             term: term.id,
             crn: section.crn,
             instructor: CASE 
               WHEN instructor IS NULL THEN null
               ELSE {
                 id: instructor.id,
                 name: instructor.name,
                 avg_difficulty: instructor.avg_difficulty,
                 avg_rating: instructor.avg_rating,
                 num_ratings: instructor.num_ratings
               }
             END
           }
           ELSE null
         END) AS collected_terms
    RETURN 
      course.id AS course_id,
      [term IN collected_terms WHERE term IS NOT NULL] AS terms
`;

interface TermData {
   term: string;
   crn: string;
   instructor: {
      id: string;
      name: string;
      avg_difficulty: number;
      avg_rating: number;
      num_ratings: number;
   } | null;
}

/**
 * GET graph/course/availabilities/{course_id}
 * Retrieve all sections available for a specific course across all terms
 */
export default factory.createHandlers(
   DescribeGraphRoute({
      description: 'Retrieve all sections available for a specific course across all terms',
      responses: {
         '200': {
            description: 'Course availabilities data with all sections and terms',
            schema: GetCourseAvailabilitiesResponseSchema,
         },
         '404': {
            description: 'Course not found',
         },
      },
   }),
   zValidator('param', ReqParamsSchema),
   async (c) => {
      const { course_id } = c.req.valid('param');

      return await neo4jService.executeReadQuery(cypher, { course_id })
         .then((records) => {
            if (!records || records.length === 0) {
               return c.json(
                  { message: 'Course not found or no availabilities' },
                  404,
               );
            }

            const record = records[0];
            const courseId = record.get('course_id');
            const terms = record.get('terms');

            if (!courseId) {
               return c.json(
                  { message: 'Course not found' },
                  404,
               );
            }

            if (!terms || terms.length === 0) {
               return c.json([], 200);
            }

            const validTerms = terms.filter((term: TermData) =>
               term &&
               term.term &&
               term.crn
            );

            return c.json(validTerms, 200);
         })
         .catch((error) => {
            return c.json(
               {
                  message: 'Internal server error',
                  error: error.message,
               },
               500,
            );
         });
   },
);
