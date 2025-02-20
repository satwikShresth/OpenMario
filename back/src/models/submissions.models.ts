import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { and, eq, like } from 'drizzle-orm';
import * as undergrad from '#/db/undergraduate.data.ts';
import * as grad from '#/db/graduate.data.ts';
import { company, coop_cycle, coop_year, location, position, program_level, submission } from '#db';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { name } from '#/models/position.models.ts';

extendZodWithOpenApi(z);

export const compensation = (schema: any) =>
   schema
      .int({ message: 'Amount must be an integer' })
      .nonnegative({ message: 'Amount cannot be negative' })
      .openapi({ description: 'Compensation amount', example: 100 });

export const year = (schema: any) =>
   schema
      .int()
      .nonnegative({ message: 'Amount cannot be negative' })
      .min(2005, { message: 'Year cannot be before 2005' })
      .refine(
         (year: any) => year <= new Date().getFullYear() + 1,
         { message: `Year must be between 2004 and ${new Date().getFullYear() + 2}` },
      )
      .openapi({ description: 'Submission Year', example: new Date().getFullYear() });

export const work_hours = (schema: any) =>
   schema
      .int({ message: 'Amount must be an integer' })
      .nonnegative({ message: 'Amount cannot be negative' })
      .min(5, { message: 'Amount must be greater than or equal to 5' })
      .max(60, { message: 'Amount must be less than or equal to 60' })
      .openapi({ description: 'Expected Work Hours', example: 40 });

export const parseOptionalInt = (name: string, min: number, max?: number) =>
   z.coerce
      .number()
      .int(`${name} must be an integer`)
      .min(min, `${name} must be at least ${min}`)
      .max(max ?? Infinity, max ? `${name} cannot exceed ${max}` : '')
      .optional();

export const SubmissionQuerySchema = z.object({
   company: name(z.string()).optional(),
   position: name(z.string()).optional(),
   location: z.string().regex(/^[A-Za-z\s.-]+,\s*[A-Z]{2}$/).optional(),
   year: z.preprocess((year) => Number(year), year(z.number())).optional(),
   coop_year: z.enum(coop_year).optional(),
   coop_cycle: z.enum(coop_cycle).optional(),
   program_level: z.enum(program_level).optional(),
   skip: parseOptionalInt('Skip', 0),
   limit: parseOptionalInt('Limit', 1, 1000),
});

export const SubmissionQuery = SubmissionQuerySchema
   .transform(
      (query) => ({
         queries: [
            query?.company ? like(company.name, `%${query.company.trim()}%`) : undefined,
            query?.position ? like(position.name, `%${query.position.trim()}%`) : undefined,
            query?.location
               ? and(
                  like(location.city, `%${query.location.split(',')[0].trim()}%`),
                  like(location.state, `%${query.location.split(',')[1].trim()}%`),
               )
               : undefined,
            query?.year ? eq(submission.year, query?.year!) : undefined,
            query?.coop_year ? eq(submission.coop_year, query?.coop_year!) : undefined,
            query?.coop_cycle ? eq(submission.coop_cycle, query?.coop_cycle!) : undefined,
            query?.program_level ? eq(submission.program_level, query?.program_level!) : undefined,
         ],
         skip: query?.skip!,
         limit: query?.limit!,
      }),
   );

export const PositionInfo = z.object({
   company: name(z.string())
      .openapi({
         description: 'Name of the company offering the position',
         example: 'Acme Corporation',
         minLength: 3,
         maxLength: 100,
         pattern: "^[a-zA-Z\\s\\-'\\p{L}\\p{M}]+$",
      }),

   position: name(z.string())
      .openapi({
         description: 'Title of the position',
         example: 'Senior Software Engineer',
         minLength: 3,
         maxLength: 100,
         pattern: "^[a-zA-Z\\s\\-'\\p{L}\\p{M}]+$",
      }),

   location: z.string()
      .regex(/^[A-Za-z\s.-]+,\s*[A-Z]{2}$/)
      .openapi({
         description: 'Location in City, State format (US only)',
         example: 'Boston, MA',
         pattern: '^[A-Za-z\\s.-]+,\\s*[A-Z]{2}$',
      }),

   work_hours: z.preprocess(
      (val) => Number(val),
      work_hours(z.number()),
   ).openapi({
      description: 'Weekly work hours',
      example: 40,
      minimum: 0,
      maximum: 168,
   }),

   compensation: compensation(z.number())
      .openapi({
         description: 'Base compensation amount',
         example: 120000,
         minimum: 0,
      }),

   other_compensation: z.string()
      .max(255, 'Cannot be more than 255 characters')
      .openapi({
         description: 'Additional compensation details (bonuses, equity, etc.)',
         example: 'Annual bonus up to 15%, stock options vesting over 4 years',
         maxLength: 255,
      }),

   details: z.string()
      .max(255, 'Cannot be more than 255 characters')
      .openapi({
         description: 'Additional position details and requirements',
         example: 'Remote work available, requires occasional travel, 5+ years experience preferred',
         maxLength: 255,
      }),
}).openapi({
   title: 'Position Information',
   description: 'Comprehensive information about a job position including company, location, compensation, and other details',
   example: {
      company: 'Acme Corporation',
      position: 'Senior Software Engineer',
      location: 'Boston, MA',
      work_hours: 40,
      compensation: 120000,
      other_compensation: 'Annual bonus up to 15%, stock options vesting over 4 years',
      details: 'Remote work available, requires occasional travel, 5+ years experience preferred',
   },
});

export const SubmissionAggregateSchema = z.object({
   positions: z.array(PositionInfo).min(1),
   year: z.preprocess((year) => Number(year), year(z.number())),
   coop_year: z.enum(coop_year),
   coop_cycle: z.enum(coop_cycle),
   program_level: z.enum(program_level),
   majors: z.array(z.enum([...undergrad.Majors, ...grad.Majors])).min(1),
   minors: z.array(z.enum([...undergrad.Minors, ...grad.Minors])).optional().default([]),
});

export const SubmissionResponseSchema = z.object({
   id: z.string(),
   year: z.number(),
   coop_year: z.number(),
   coop_cycle: z.string(),
   program_level: z.string(),
   work_hours: z.number(),
   compensation: z.number(),
   other_compensation: z.string(),
   details: z.string(),
   position: z.string(),
   company: z.string(),
   location_city: z.string(),
   location_state: z.string(),
   location_state_code: z.string(),
});

export const SubmissionSchema = createSelectSchema(submission);

export const SubmissionInsertSchema = createInsertSchema(submission, { work_hours, year, compensation });
export const SubmissionUpdateSchema = createUpdateSchema(submission, { work_hours, year, compensation });

export type Submission = z.infer<typeof SubmissionSchema>;
export type SubmissionInsert = z.infer<typeof SubmissionInsertSchema>;
export type SubmissionUpdate = z.infer<typeof SubmissionUpdateSchema>;

export type SubmissionAggregateUpdate = z.infer<typeof SubmissionAggregateUpdateSchema>;
export const SubmissionAggregateUpdateSchema = SubmissionAggregateSchema.partial();
export type SubmissionAggregate = z.infer<typeof SubmissionAggregateSchema>;
export type SubmissionQuery = z.infer<typeof SubmissionQuery>;
export type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;
