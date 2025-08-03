import { validator as zValidator } from 'hono-openapi/zod';
import { neo4jService } from '#/services/neo4j.service.ts';
import { GetCourseAvailabilitiesResponseSchema, ReqParamsSchema } from '#models';
import { DescribeGraphRoute, factory } from './common.ts';

const cypher = `
    MATCH (course:Course)-[offers:OFFERS]->(section:Section)-[:OFFERED_ON]->(term:Term)
    WHERE course.id = $course_id AND offers.instruction_type = 'Lecture'
    OPTIONAL MATCH (instructor:Instructor)-[:TEACHES]->(section)
    RETURN COLLECT(DISTINCT {
      term: term.id,
      crn: section.crn,
      instructor: {
        id: instructor.id,
        name: instructor.name,
        avg_difficulty: instructor.avg_difficulty,
        avg_rating: instructor.avg_rating,
        num_ratings: instructor.num_ratings
      }
    }) AS terms
  `;

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

      return await neo4jService
         .executeReadQuery(cypher, { course_id })
         .then((records) => {
            if (!records || records.length === 0) {
               return c.json(
                  { message: 'Course not found or no availabilities' },
                  404,
               );
            }

            const terms = records[0].get('terms');

            if (!terms || terms.length === 0) {
               return c.json(
                  { message: 'Course not found or no availabilities' },
                  404,
               );
            }

            return c.json(terms, 200);
         })
         .catch((error) => {
            console.error('Error fetching course availabilities:', error);
            return c.json({ message: error.message }, 500);
         });
   },
);
