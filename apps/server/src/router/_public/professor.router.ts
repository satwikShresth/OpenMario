import { os } from '@/router/helpers';
import { db, instructorProfileMView, instructorSectionsMView } from '@/db';
import { and, eq, asc, sql, desc } from 'drizzle-orm';
import { maybe } from '@/utils';

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
      .select()
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
   async ({
      input: {
         params: { professor_id }
      }
   }) => {
      const [row] = await db
         .select()
         .from(instructorProfileMView)
         .where(eq(instructorProfileMView.instructor_id, professor_id))
         .limit(1);

      if (!row) throw new Error('Professor not found');

      return row;
   }
);

// ============================================================================
// GET /professors/{professor_id}/sections
// ============================================================================

export const getProfessorSections = os.professor.sections.handler(
   async ({
      input: {
         params: { professor_id }
      }
   }) => {
      const result = await db
         .select()
         .from(instructorSectionsMView)
         .where(eq(instructorSectionsMView.instructor_id, professor_id))
         .orderBy(desc(instructorSectionsMView.term_id));

      if (!result) throw new Error('Professor not found');

      return result;
   }
);
