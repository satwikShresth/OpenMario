import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * Submission Contracts
 * Defines contracts for co-op submission endpoints
 */

// Enum arrays (should match database enums exactly)
const coop_year = ['1st', '2nd', '3rd'] as const;
const coop_cycle = [
   'Fall/Winter',
   'Winter/Spring',
   'Spring/Summer',
   'Summer/Fall'
] as const;
const program_level = ['Undergraduate', 'Graduate'] as const;

// Helper function to ensure array input
const ensureArray = <T extends z.ZodTypeAny>(schema: T) =>
   z.preprocess(val => (Array.isArray(val) ? val : [val]), z.array(schema));

// Common schemas
export const SubmissionQuerySchema = z.object({
   company: ensureArray(z.string().min(3).max(100)).optional(),
   position: ensureArray(z.string().min(3).max(100)).optional(),
   location: ensureArray(
      z.string().regex(/^[A-Za-z\s.-]+,\s*[A-Z]{2}$/)
   ).optional(),
   year: ensureArray(z.coerce.number()).optional(),
   coop_year: ensureArray(z.enum(coop_year)).optional(),
   coop_cycle: ensureArray(z.enum(coop_cycle)).optional(),
   program_level: z.enum(program_level).optional(),
   sort: z.enum(['ASC', 'DESC']).optional().default('DESC'),
   sortField: z
      .enum(['company', 'position', 'location', 'year', 'coop', 'compensation'])
      .optional()
      .default('compensation'),
   pageIndex: z.coerce.number().nonnegative().min(1).optional().default(1),
   pageSize: z.coerce.number().nonnegative().max(100).optional().default(10),
   distinct: z.coerce.boolean().default(true)
});

export const SubmissionAggregateSchema = z.object({
   company: z.string().min(3).max(100),
   position: z.string().min(3).max(100),
   location: z.string(),
   work_hours: z.number().int().min(5).max(60),
   compensation: z.number().nonnegative(),
   other_compensation: z.string().max(255),
   details: z.string().max(255),
   year: z.number().int().min(2005),
   coop_year: z.enum(coop_year),
   coop_cycle: z.enum(coop_cycle),
   program_level: z.enum(program_level)
});

export const SubmissionAggregateUpdateSchema = SubmissionAggregateSchema.extend(
   {
      id: z.uuid().optional()
   }
);

// Response schemas
export const SubmissionListItemSchema = z.object({
   year: z.number(),
   coop_year: z.string(),
   coop_cycle: z.string(),
   program_level: z.string(),
   work_hours: z.number(),
   compensation: z.number(),
   other_compensation: z.string().nullable(),
   details: z.string().nullable(),
   company: z.string(),
   position: z.string(),
   location_city: z.string(),
   location_state: z.string(),
   location_state_code: z.string()
});

export const SubmissionListResponseSchema = z.object({
   pageIndex: z.number(),
   pageSize: z.number(),
   count: z.number(),
   data: z.array(SubmissionListItemSchema)
});

export const SubmissionItemSchema = z.object({
   id: z.string(),
   owner_id: z.string().nullable(),
   year: z.number(),
   coop_year: z.string(),
   coop_cycle: z.string(),
   program_level: z.string(),
   work_hours: z.number(),
   compensation: z.number(),
   other_compensation: z.string().nullable(),
   details: z.string().nullable(),
   company: z.string(),
   position: z.string(),
   location_city: z.string(),
   location_state: z.string(),
   location_state_code: z.string(),
   location: z.string()
});

export const SubmissionCreateResponseSchema = z.object({
   id: z.string(),
   owner_id: z.string().nullable(),
   message: z.string()
});

export const SubmissionUpdateResponseSchema = z.object({
   id: z.uuid(),
   message: z.string()
});

// Contracts
export const listSubmissionsContract = oc
   .route({
      method: 'GET',
      path: '/submissions',
      summary: 'List submissions',
      description:
         'Retrieve co-op submission records with pagination and filtering',
      tags: ['Submissions']
   })
   .input(SubmissionQuerySchema)
   .output(SubmissionListResponseSchema);

export const createSubmissionContract = oc
   .route({
      method: 'POST',
      path: '/submissions',
      summary: 'Create submission',
      description: 'Create new co-op submission(s)',
      tags: ['Submissions']
   })
   .input(SubmissionAggregateSchema)
   .output(SubmissionCreateResponseSchema);

export const updateSubmissionContract = oc
   .route({
      method: 'PATCH',
      path: '/submissions',
      summary: 'Update submission',
      description: 'Update an existing co-op submission',
      tags: ['Submissions']
   })
   .input(SubmissionAggregateUpdateSchema)
   .output(SubmissionUpdateResponseSchema);

// Submission contract router
export const submissionContract = {
   list: listSubmissionsContract,
   create: createSubmissionContract,
   update: updateSubmissionContract
};
