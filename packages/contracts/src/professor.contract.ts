import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * Professor Contracts
 * Defines contracts for instructor/professor endpoints
 */

// ============================================================================
// GET /professors
// ============================================================================

export const ProfessorListQuerySchema = z.object({
   search: z.string().min(1).max(200).optional(),
   department: z.string().min(1).max(100).optional(),
   sort_by: z
      .enum([
         'avg_rating',
         'avg_difficulty',
         'num_ratings',
         'total_sections_taught',
         'instructor_name'
      ])
      .optional()
      .default('num_ratings'),
   order: z.enum(['asc', 'desc']).optional().default('desc'),
   pageIndex: z.coerce.number().nonnegative().min(1).optional().default(1),
   pageSize: z.coerce.number().nonnegative().max(100).optional().default(20)
});

export const ProfessorListItemSchema = z.object({
   instructor_id: z.coerce.number(),
   instructor_name: z.string(),
   department: z.string().nullable(),
   avg_rating: z.coerce.number().nullable(),
   avg_difficulty: z.coerce.number().nullable(),
   num_ratings: z.coerce.number().nullable(),
   rmp_id: z.string().nullable(),
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
      .transform(arr => arr?.filter((s): s is string => s !== null) ?? null)
});

export const ProfessorListResponseSchema = z.object({
   pageIndex: z.number(),
   pageSize: z.number(),
   count: z.number(),
   data: z.array(ProfessorListItemSchema)
});

export const listProfessorsContract = oc
   .route({
      method: 'GET',
      path: '/professors',
      summary: 'List professors',
      description:
         'Retrieve instructors with profile stats and teaching history',
      tags: ['Professors']
   })
   .input(ProfessorListQuerySchema)
   .output(ProfessorListResponseSchema);

// ============================================================================
// GET /professors/{professor_id}
// ============================================================================

export const ProfessorIdParamSchema = z.object({
   professor_id: z.coerce.number().int().positive()
});

export const getProfessorContract = oc
   .route({
      method: 'GET',
      path: '/professors/{professor_id}',
      summary: 'Get professor profile',
      description: 'Retrieve full professor profile with stats',
      tags: ['Professors']
   })
   .input(ProfessorIdParamSchema)
   .output(ProfessorListItemSchema);

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
      tags: ['Professors']
   })
   .input(ProfessorIdParamSchema)
   .output(z.array(ProfessorSectionSchema));

// ============================================================================
// Professor contract router
// ============================================================================

export const professorContract = {
   list: listProfessorsContract,
   get: getProfessorContract,
   sections: getProfessorSectionsContract
};
