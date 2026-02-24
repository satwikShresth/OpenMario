import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { sql, eq } from 'drizzle-orm';
import {
   instructor,
   instructor_sections,
   section,
   course,
   subject
} from '../tables';

// instructorProfileMView moved to views/to_be_removed.ts pending manual DROP

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
