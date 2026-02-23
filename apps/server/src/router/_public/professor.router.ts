import { os } from '@/router/helpers';
import { db, instructorProfileMView } from '@/db';
import { and, eq, asc, sql } from 'drizzle-orm';
import { maybe } from '@/utils';

const profileFields = {
   instructor_id: instructorProfileMView.instructor_id,
   instructor_name: instructorProfileMView.instructor_name,
   department: instructorProfileMView.department,
   avg_rating: instructorProfileMView.avg_rating,
   avg_difficulty: instructorProfileMView.avg_difficulty,
   num_ratings: instructorProfileMView.num_ratings,
   rmp_id: instructorProfileMView.rmp_id,
   total_sections_taught: instructorProfileMView.total_sections_taught,
   total_courses_taught: instructorProfileMView.total_courses_taught,
   total_terms_active: instructorProfileMView.total_terms_active,
   most_recent_term: instructorProfileMView.most_recent_term,
   subjects_taught: instructorProfileMView.subjects_taught,
   instruction_methods: instructorProfileMView.instruction_methods
};

// ============================================================================
// GET /professors
// ============================================================================

export const listProfessors = os.professor.list.handler(async ({ input }) => {
   const { search, department, sort_by, order, pageIndex, pageSize } = input;

   const whereClause = and(
      maybe(search, (s: string) => {
         const terms = s.trim().split(/\s+/);

         const termClauses = terms.map(
            term => sql`paradedb.boolean(
               should => ARRAY[
                  paradedb.fuzzy_term('instructor_name', ${term}, distance => 2),
                  paradedb.boost(3.0, paradedb.fuzzy_term('instructor_name', ${term}, distance => 2, prefix => true)),
                  paradedb.fuzzy_term('department',      ${term}, distance => 2),
                  paradedb.boost(1.5, paradedb.fuzzy_term('department',      ${term}, distance => 2, prefix => true))
               ]
            )`
         );

         return sql`${instructorProfileMView.instructor_id} @@@ paradedb.boolean(
            must => ARRAY[${sql.join(termClauses, sql`, `)}]
         )`;
      }),
      maybe(department, (d: string) => {
         const terms = d.trim().split(/\s+/);

         const termClauses = terms.map(
            term => sql`paradedb.boolean(
               should => ARRAY[
                  paradedb.fuzzy_term('department', ${term}, distance => 2),
                  paradedb.boost(2.0, paradedb.fuzzy_term('department', ${term}, distance => 2, prefix => true))
               ]
            )`
         );

         return sql`${instructorProfileMView.instructor_id} @@@ paradedb.boolean(
            must => ARRAY[${sql.join(termClauses, sql`, `)}]
         )`;
      })
   );

   const sortColumnMap = {
      avg_rating: sql`avg_rating`,
      avg_difficulty: sql`avg_difficulty`,
      num_ratings: sql`num_ratings`,
      total_sections_taught: sql`total_sections_taught`,
      instructor_name: sql`instructor_name`
   };

   const sortCol = sortColumnMap[sort_by] ?? sql`num_ratings`;
   const orderExpr =
      order === 'asc' ? asc(sortCol) : sql`${sortCol} DESC NULLS LAST`;

   const countPromise = db.$count(instructorProfileMView, whereClause);
   const dataPromise = db
      .select(profileFields)
      .from(instructorProfileMView)
      .where(whereClause)
      .orderBy(orderExpr)
      .offset((pageIndex - 1) * pageSize)
      .limit(pageSize);

   return await Promise.all([countPromise, dataPromise])
      .then(([count, data]) => ({
         pageIndex,
         pageSize,
         count,
         data
      }))
      .catch(error => {
         console.error('Error listing professors:', error);
         throw new Error(error.message || 'Failed to list professors');
      });
});

// ============================================================================
// GET /professors/{professor_id}
// ============================================================================

export const getProfessor = os.professor.get.handler(
   async ({ input: { professor_id } }) => {
      const [row] = await db
         .select(profileFields)
         .from(instructorProfileMView)
         .where(eq(instructorProfileMView.instructor_id, professor_id))
         .limit(1);

      if (!row) throw new Error('Professor not found');

      return row as any;
   }
);

// ============================================================================
// GET /professors/{professor_id}/sections
// ============================================================================

export const getProfessorSections = os.professor.sections.handler(
   async ({ input: { professor_id } }) => {
      // instructor_sections_m_view was created without .as() aliases, so the
      // actual DB column names follow the underlying table column names:
      //   instructor.id   → "id"      (not "instructor_id")
      //   section.crn     → "crn"     (not "section_crn")
      //   course.title    → "title"   (not "course_title")
      //   section.section → "section" (not "section_code")
      const result = await db.execute(sql`
         SELECT
            crn               AS section_crn,
            term_id,
            subject_code,
            course_number,
            title             AS course_title,
            section           AS section_code,
            instruction_method,
            instruction_type
         FROM instructor_sections_m_view
         WHERE id = ${professor_id}
         ORDER BY term_id DESC
      `);

      return result.rows as any;
   }
);
