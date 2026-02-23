import { os } from '@/router/helpers';
import { db, instructorProfileMView, instructorSectionsMView } from '@/db';
import { and, desc, eq, ilike, or, asc, sql } from 'drizzle-orm';
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
      maybe(search, s =>
         or(
            ilike(instructorProfileMView.instructor_name, `%${s}%`),
            ilike(instructorProfileMView.department, `%${s}%`)
         )
      ),
      maybe(department, d => ilike(instructorProfileMView.department, `%${d}%`))
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
// GET /professors/:professor_id
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
// GET /professors/:professor_id/sections
// ============================================================================

export const getProfessorSections = os.professor.sections.handler(
   async ({ input: { professor_id } }) => {
      const rows = await db
         .select()
         .from(instructorSectionsMView)
         .where(eq(instructorSectionsMView.instructor_id, professor_id))
         .orderBy(desc(instructorSectionsMView.term_id));

      return rows as any;
   }
);
