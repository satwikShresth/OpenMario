import { os } from '@/router/helpers';
import { db, meiliProfessorsIdx, instructorSectionsMView } from '@openmario/db';
import { eq, desc } from 'drizzle-orm';

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
         .from(meiliProfessorsIdx)
         .where(eq(meiliProfessorsIdx.id, professor_id))
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
