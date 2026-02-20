import { alias, pgMaterializedView } from 'drizzle-orm/pg-core';
import { eq, sql } from 'drizzle-orm';
import {
   course,
   course_corequisites,
   course_prerequisites
} from './course_tables';

const prereqCourse = alias(course, 'prereq_course');
const coreqCourse = alias(course, 'coreq_course');

/**
 * Flat view of every prerequisite relationship with full course details
 * for both the requiring course and the required course.
 * Group by (course_id, group_id) to reconstruct OR-choice groups.
 */
export const prerequisitesMView = pgMaterializedView('prerequisites_m_view')
   .with({ fillfactor: 90 })
   .as(qb =>
      qb
         .select({
            course_id: course_prerequisites.course_id,
            course_title: sql<string>`${course.title}`.as('course_title'),
            course_subject_id: sql<string>`${course.subject_id}`.as('course_subject_id'),
            course_number: sql<string>`${course.course_number}`.as('course_number'),
            prereq_id: sql<string>`${prereqCourse.id}`.as('prereq_id'),
            prereq_title: sql<string>`${prereqCourse.title}`.as('prereq_title'),
            prereq_subject_id: sql<string>`${prereqCourse.subject_id}`.as('prereq_subject_id'),
            prereq_course_number: sql<string>`${prereqCourse.course_number}`.as('prereq_course_number'),
            relationship_type: course_prerequisites.relationship_type,
            group_id: course_prerequisites.group_id,
            can_take_concurrent: course_prerequisites.can_take_concurrent,
            minimum_grade: course_prerequisites.minimum_grade
         })
         .from(course_prerequisites)
         .innerJoin(course, eq(course.id, course_prerequisites.course_id))
         .innerJoin(
            prereqCourse,
            eq(prereqCourse.id, course_prerequisites.prerequisite_course_id)
         )
   );

/**
 * Flat view of every corequisite relationship with full course details
 * for both sides of the relationship.
 */
export const corequisitesMView = pgMaterializedView('corequisites_m_view')
   .with({ fillfactor: 90 })
   .as(qb =>
      qb
         .select({
            course_id: course_corequisites.course_id,
            course_title: sql<string>`${course.title}`.as('course_title'),
            course_subject_id: sql<string>`${course.subject_id}`.as('course_subject_id'),
            course_number: sql<string>`${course.course_number}`.as('course_number'),
            coreq_id: sql<string>`${coreqCourse.id}`.as('coreq_id'),
            coreq_title: sql<string>`${coreqCourse.title}`.as('coreq_title'),
            coreq_subject_id: sql<string>`${coreqCourse.subject_id}`.as('coreq_subject_id'),
            coreq_course_number: sql<string>`${coreqCourse.course_number}`.as('coreq_course_number')
         })
         .from(course_corequisites)
         .innerJoin(course, eq(course.id, course_corequisites.course_id))
         .innerJoin(
            coreqCourse,
            eq(coreqCourse.id, course_corequisites.corequisite_course_id)
         )
   );
