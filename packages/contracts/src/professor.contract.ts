import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * Professor Contracts
 * Defines contracts for instructor/professor endpoints
 */

// ============================================================================
// GET /professors/{professor_id}
// ============================================================================

export const ProfessorIdParamSchema = z.object({
   professor_id: z.coerce.number().int().positive()
});

export const ProfessorDetailSchema = z.object({
   id: z.coerce.number(),
   name: z.string(),
   department: z.string().nullable(),
   avg_rating: z.coerce.number().nullable(),
   avg_difficulty: z.coerce.number().nullable(),
   num_ratings: z.coerce.number().nullable(),
   rmp_id: z.string().nullable(),
   rmp_legacy_id: z.coerce.number().nullable(),
   weighted_score: z.coerce.number().nullable(),
   total_sections_taught: z.coerce.number(),
   total_courses_taught: z.coerce.number(),
   total_terms_active: z.coerce.number(),
   most_recent_term: z.coerce.number().nullable(),
   subjects_taught: z
      .array(z.string().nullable())
      .nullable()
      .transform(arr => arr?.filter((s): s is string => s !== null) ?? null),
   instruction_methods: z
      .array(z.string().nullable())
      .nullable()
      .transform(arr => arr?.filter((s): s is string => s !== null) ?? null),
   courses_taught: z
      .array(
         z.object({
            code: z.string(),
            title: z.string()
         })
      )
      .default([])
});

export const getProfessorContract = oc
   .route({
      method: 'GET',
      path: '/professors/{professor_id}',
      summary: 'Get professor profile',
      description: 'Retrieve full professor profile with stats',
      tags: ['Professors'],
      inputStructure: 'detailed'
   })
   .input(z.object({ params: ProfessorIdParamSchema }))
   .output(ProfessorDetailSchema);

// ============================================================================
// GET /professors/{professor_id}/sections
// ============================================================================

export const ProfessorSectionSchema = z.object({
   section_crn: z.number(),
   term_id: z.number(),
   subject_code: z.string(),
   course_number: z.string(),
   course_title: z.string(),
   section_code: z.string(),
   instruction_method: z.string().nullable(),
   instruction_type: z.string().nullable()
});

export const getProfessorSectionsContract = oc
   .route({
      method: 'GET',
      path: '/professors/{professor_id}/sections',
      summary: 'Get professor sections',
      description:
         'Retrieve all sections taught by a professor across all terms',
      tags: ['Professors'],
      inputStructure: 'detailed'
   })
   .input(z.object({ params: ProfessorIdParamSchema }))
   .output(z.array(ProfessorSectionSchema));

// ============================================================================
// Professor contract router
// ============================================================================

export const professorContract = {
   get: getProfessorContract,
   sections: getProfessorSectionsContract
};
