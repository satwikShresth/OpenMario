import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { sql, eq } from 'drizzle-orm';
import {
   instructor,
   instructor_sections,
   section,
   course,
   subject
} from '../tables';

export const instructorProfileMView = pgMaterializedView(
   'instructor_profile_m_view'
).as(qb =>
   qb
      .select({
         instructor_id: sql<number>`${instructor.id}`.as('instructor_id'),
         instructor_name: sql<string>`${instructor.name}`.as('instructor_name'),
         department: instructor.department,
         avg_rating: instructor.avg_rating,
         avg_difficulty: instructor.avg_difficulty,
         num_ratings: instructor.num_ratings,
         rmp_id: instructor.rmp_id,
         legacy_rmp_id: instructor.rmp_legacy_id,
         total_sections_taught: sql<number>`count(distinct ${section.crn})`.as(
            'total_sections_taught'
         ),
         total_courses_taught: sql<number>`count(distinct ${course.id})`.as(
            'total_courses_taught'
         ),
         total_terms_active: sql<number>`count(distinct ${section.term_id})`.as(
            'total_terms_active'
         ),
         most_recent_term: sql<number>`max(${section.term_id})`.as(
            'most_recent_term'
         ),
         subjects_taught: sql<string[]>`array_agg(distinct ${subject.id})`.as(
            'subjects_taught'
         ),
         instruction_methods: sql<
            string[]
         >`array_agg(distinct ${section.instruction_method})`.as(
            'instruction_methods'
         )
      })
      .from(instructor)
      .leftJoin(
         instructor_sections,
         eq(instructor_sections.instructor_id, instructor.id)
      )
      .leftJoin(section, eq(section.crn, instructor_sections.section_crn))
      .leftJoin(course, eq(course.id, section.course_id))
      .leftJoin(subject, eq(subject.id, section.subject_code))
      .groupBy(
         instructor.id,
         instructor.name,
         instructor.department,
         instructor.avg_rating,
         instructor.avg_difficulty,
         instructor.num_ratings,
         instructor.rmp_id,
         instructor.rmp_legacy_id
      )
);

export const instructorSectionsMView = pgMaterializedView(
   'instructor_sections_m_view'
).as(qb =>
   qb
      .select({
         instructor_id: sql<number>`${instructor.id}`.as('instructor_id'),
         instructor_name: sql<string>`${instructor.name}`.as('instructor_name'),
         section_crn: sql<number>`${section.crn}`.as('section_crn'),
         term_id: sql<number>`${section.term_id}`.as('term_id'),
         subject_code: sql<string>`${section.subject_code}`.as('subject_code'),
         course_number: sql<string>`${section.course_number}`.as(
            'course_number'
         ),
         course_title: sql<string>`${course.title}`.as('course_title'),
         section_code: sql<string>`${section.section}`.as('section_code'),
         instruction_method: sql<
            string | null
         >`${section.instruction_method}`.as('instruction_method'),
         instruction_type: sql<string | null>`${section.instruction_type}`.as(
            'instruction_type'
         )
      })
      .from(instructor)
      .innerJoin(
         instructor_sections,
         eq(instructor_sections.instructor_id, instructor.id)
      )
      .innerJoin(section, eq(section.crn, instructor_sections.section_crn))
      .innerJoin(course, eq(course.id, section.course_id))
      .innerJoin(subject, eq(subject.id, section.subject_code))
);
