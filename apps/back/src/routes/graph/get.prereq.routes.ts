import { validator as zValidator } from 'hono-openapi/zod';
import { neo4jService } from '#/services/neo4j.service.ts';
import { GetPrereqResponseSchema, type PrereqParams, PrereqParamsSchema } from '#models';
import Cypher from '@neo4j/cypher-builder';
import { DescribeGraphRoute, factory } from './common.ts';

const buildQuery = (course_id: string) => {
   const course = new Cypher.Node();
   const prereq = new Cypher.Node();
   const prerequisiteRel = new Cypher.Relationship();

   // Create the prerequisite pattern - prereq has PREREQUISITE relationship TO course
   const prerequisitePattern = new Cypher.Pattern(prereq, {
      labels: ['Course'],
   })
      .related(prerequisiteRel, { type: 'PREREQUISITE', direction: 'right' })
      .to(course);

   return new Cypher.Match(new Cypher.Pattern(course, { labels: ['Course'] }))
      .where(Cypher.eq(course.property('id'), new Cypher.Param(course_id)))
      .optionalMatch(prerequisitePattern)
      .return(
         [course.property('id'), 'courseId'],
         [course.property('title'), 'courseName'],
         [course.property('subject_id'), 'subjectId'],
         [course.property('course_number'), 'courseNumber'],
         [
            Cypher.collect(
               new Cypher.Map({
                  // Course properties
                  id: prereq.property('id'),
                  name: prereq.property('title'),
                  subjectId: prereq.property('subject_id'),
                  courseNumber: prereq.property('course_number'),
                  // Relationship properties
                  relationshipType: prerequisiteRel.property('relationship_type'),
                  groupId: prerequisiteRel.property('group_id'),
                  canTakeConcurrent: prerequisiteRel.property('can_take_concurrent'),
                  minimumGrade: prerequisiteRel.property('minimum_grade'),
                  relationshipId: Cypher.id(prerequisiteRel),
               }),
            ),
            'prerequisites',
         ],
      )
      .build();
};

/**
 * GET graph/prereq/{course_id}
 * Retrieve all prereq (with its attributes) for a specific course
 */
export default factory.createHandlers(
   DescribeGraphRoute({
      description: 'Retrieve prerequisites for a specific course',
      responses: {
         '200': {
            description: 'Course prerequisites data',
            schema: GetPrereqResponseSchema,
         },
         '404': {
            description: 'Course not found',
         },
      },
   }),
   zValidator('param', PrereqParamsSchema),
   async (c) => {
      const { course_id } = c.req.valid('param') as PrereqParams;
      const { cypher, params } = buildQuery(course_id);

      return await neo4jService
         .executeReadQuery(cypher, params)
         .then((records) => {
            if (records.length === 0) {
               return c.json({ message: 'Course not found' }, 404);
            }

            const record = records[0];
            const data = {
               course: {
                  id: record.get('courseId'),
                  name: record.get('courseName'),
                  subjectId: record.get('subjectId'),
                  courseNumber: record.get('courseNumber'),
               },
               prerequisites: record
                  .get('prerequisites')
                  .filter((p: any) => p.id !== null),
            };

            // Transform prerequisites to group by groupId
            const transformedData = {
               ...data,
               prerequisites: Object.values(
                  data.prerequisites.reduce(
                     (acc: any, { groupId, ...prereq }: any) => {
                        (acc[groupId] ??= []).push(prereq);
                        return acc;
                     },
                     {},
                  ),
               ),
            };

            return c.json({ data: transformedData }, 200);
         })
         .catch((error) => {
            console.error('Error fetching prerequisites:', error);
            return c.json({ message: error.message }, 500);
         });
   },
);
