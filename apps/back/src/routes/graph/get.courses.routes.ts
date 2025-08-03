import { validator as zValidator } from 'hono-openapi/zod';
import { neo4jService } from '#/services/neo4j.service.ts';
import { GetCourseResponseSchema, ReqParamsSchema } from '#models';
import { DescribeGraphRoute, factory } from './common.ts';

const cypher = `
    MATCH (course:Course)
    MATCH (course)-[offers:OFFERS]->(section:Section)
    WHERE course.id = $course_id
    RETURN course.id AS id,
           course.subject_id AS subject_id,
           course.course_number AS course_number,
           course.title AS title,
           course.description AS description,
           course.credits AS credits,
           course.writing_intensive AS writing_intensive,
           course.repeat_status AS repeat_status,
           offers.instruction_type AS instruction_type,
           offers.instruction_method AS instruction_method,
           section.crn AS crn
`;

/**
 * GET graph/course/{course_id}
 * Retrieve all attributes for a specific course
 */
export default factory.createHandlers(
   DescribeGraphRoute({
      description: 'Retrieve all attributes for a specific course',
      responses: {
         '200': {
            description: 'Course data with all attributes',
            schema: GetCourseResponseSchema,
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
         .then(
            ([record]) =>
               !record
                  ? c.json(
                     { message: 'Course not found' },
                     404,
                  )
                  : c.json(
                     {
                        data: {
                           id: record.get('id'),
                           subject_id: record.get('subject_id'),
                           course_number: record.get('course_number'),
                           title: record.get('title'),
                           description: record.get('description'),
                           credits: record.get('credits'),
                           writing_intensive: record.get('writing_intensive'),
                           repeat_status: record.get('repeat_status'),
                           instruction_type: record.get('instruction_type'),
                           instruction_method: record.get('instruction_method'),
                           crn: record.get('crn'),
                        },
                     },
                     200,
                  ),
         )
         .catch((error) => {
            console.error('Error fetching course:', error);
            return c.json({ message: error.message }, 500);
         });
   },
);
