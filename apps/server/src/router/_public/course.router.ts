import { os } from '@/router/helpers';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import {
   course,
   instructor,
   instructor_sections,
   section,
   prerequisitesMView,
   corequisitesMView
} from '@/db';

// ---------------------------------------------------------------------------
// GET /courses/{course_id}
// ---------------------------------------------------------------------------

export const getCourse = os.course.course.handler(
   async ({ input: { params: { course_id } } }) => {
      const rows = await db
         .select({
            id: course.id,
            subject_id: course.subject_id,
            course_number: course.course_number,
            title: course.title,
            description: course.description,
            credits: course.credits,
            writing_intensive: course.writing_intensive,
            repeat_status: course.repeat_status,
            crn: section.crn,
            instruction_type: section.instruction_type,
            instruction_method: section.instruction_method
         })
         .from(course)
         .leftJoin(section, eq(section.course_id, course.id))
         .where(eq(course.id, course_id))
         .limit(1);

      if (rows.length === 0) throw new Error('Course not found');

      const row = rows[0]!;
      return {
         data: {
            ...row,
            credits: row.credits ? Number.parseFloat(row.credits) : 0
         }
      };
   }
);

// ---------------------------------------------------------------------------
// GET /courses/{course_id}/prerequisites
// ---------------------------------------------------------------------------

export const getCoursePrerequisites = os.course.prerequisites.handler(
   async ({ input: { course_id } }) => {
      const [courseRow] = await db
         .select({
            id: course.id,
            name: course.title,
            subjectId: course.subject_id,
            courseNumber: course.course_number
         })
         .from(course)
         .where(eq(course.id, course_id))
         .limit(1);

      if (!courseRow) throw new Error('Course not found');

      const rows = await db
         .select()
         .from(prerequisitesMView)
         .where(eq(prerequisitesMView.course_id, course_id));

      const prerequisites = Object.values(
         rows.reduce<
            Record<
               string,
               {
                  id: string;
                  name: string;
                  subjectId: string;
                  courseNumber: string;
                  relationshipType: string;
                  groupId: string;
                  canTakeConcurrent: boolean;
                  minimumGrade: string;
               }[]
            >
         >((acc, row) => {
            if (!acc[row.group_id]) acc[row.group_id] = [];
            acc[row.group_id]!.push({
               id: row.prereq_id,
               name: row.prereq_title,
               subjectId: row.prereq_subject_id,
               courseNumber: row.prereq_course_number,
               relationshipType: row.relationship_type,
               groupId: row.group_id,
               canTakeConcurrent: row.can_take_concurrent,
               minimumGrade: row.minimum_grade ?? ''
            });
            return acc;
         }, {})
      );

      return { data: { course: courseRow, prerequisites } };
   }
);

// ---------------------------------------------------------------------------
// GET /courses/{course_id}/corequisites
// ---------------------------------------------------------------------------

export const getCourseCorequistes = os.course.corequisites.handler(
   async ({ input: { course_id } }) => {
      const [courseRow] = await db
         .select({
            id: course.id,
            name: course.title,
            subjectId: course.subject_id,
            courseNumber: course.course_number
         })
         .from(course)
         .where(eq(course.id, course_id))
         .limit(1);

      if (!courseRow) throw new Error('Course not found');

      const rows = await db
         .select()
         .from(corequisitesMView)
         .where(eq(corequisitesMView.course_id, course_id));

      return {
         data: {
            course: courseRow,
            corequisites: rows.map(row => ({
               id: row.coreq_id,
               name: row.coreq_title,
               subjectId: row.coreq_subject_id,
               courseNumber: row.coreq_course_number
            }))
         }
      };
   }
);

// ---------------------------------------------------------------------------
// GET /courses/{course_id}/availabilities
// ---------------------------------------------------------------------------

export const getCourseAvailabilities = os.course.availabilities.handler(
   async ({ input: { course_id } }) => {
      const rows = await db
         .select({
            term: section.term_id,
            crn: section.crn,
            instructor_id: instructor.id,
            instructor_name: instructor.name,
            avg_difficulty: instructor.avg_difficulty,
            avg_rating: instructor.avg_rating,
            num_ratings: instructor.num_ratings
         })
         .from(section)
         .leftJoin(
            instructor_sections,
            eq(instructor_sections.section_crn, section.crn)
         )
         .leftJoin(
            instructor,
            eq(instructor.id, instructor_sections.instructor_id)
         )
         .where(eq(section.course_id, course_id));

      return rows.map(row => ({
         term: String(row.term),
         crn: String(row.crn),
         instructor: row.instructor_id
            ? {
                 id: row.instructor_id,
                 name: row.instructor_name!,
                 avg_difficulty: row.avg_difficulty
                    ? Number.parseFloat(row.avg_difficulty)
                    : null,
                 avg_rating: row.avg_rating
                    ? Number.parseFloat(row.avg_rating)
                    : null,
                 num_ratings: row.num_ratings
              }
            : null
      }));
   }
);
