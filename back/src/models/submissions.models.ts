import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { and, Column, eq, like, SQL, sql } from 'drizzle-orm';
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

const ensureArray = <T extends z.ZodTypeAny>(schema: T) =>
   z.preprocess(
      (val) => (Array.isArray(val) ? val : [val]),
      z.array(schema),
   );

export const SubmissionQuerySchema = z.object({
   company: ensureArray(name(z.string())).optional(),
   position: ensureArray(name(z.string())).optional(),
   location: ensureArray(z.string().regex(/^[A-Za-z\s.-]+,\s*[A-Z]{2}$/)).optional(),
   year: ensureArray(z.preprocess((year) => Number(year), z.number())).optional(),
   coop_year: ensureArray(z.enum(coop_year)).optional(),
   coop_cycle: ensureArray(z.enum(coop_cycle)).optional(),
   program_level: z.enum(program_level).optional(),
   skip: parseOptionalInt('Skip', 0),
   limit: parseOptionalInt('Limit', 1, 1000),
});
export const querySQL = (column: Column, matchValue?: string) =>
   matchValue &&
   sql`(
    to_tsvector('english', ${column}) @@ to_tsquery('english', ${
      matchValue
         .trim()
         .split(/\s+/)
         .map((term) => `${term}:*`)
         .join(' & ')
   })
    OR ${column} % ${matchValue.trim()}
    OR ${column} ILIKE ${matchValue.trim().toLowerCase().split('').join('%') + '%'}
  )`;

export const orderSQL = (column: Column, matchValue?: string) =>
   matchValue &&
   sql`(
    (CASE WHEN lower(${column}) ILIKE ${
      matchValue
         .trim()
         .toLowerCase()
         .split('')
         .reduce((pattern, char, idx) => idx === 0 ? char + '%' : pattern + ' ' + char + '%', '')
   } THEN 1 ELSE 0 END) * 10000
    + similarity(${column}, ${matchValue.trim()})
  ) DESC`;

export const SubmissionQuery = SubmissionQuerySchema
   .transform(
      (query): { query?: (SQL | undefined | string)[]; skip?: number; limit?: number } => ({
         query: [
            ...(query?.company?.map((company_) => eq(company.name, company_)) || []),
            ...(query?.position?.map((position_) => querySQL(position.name, position_)) || []),
            ...(query?.location?.map((loc) =>
               and(
                  eq(location.city, loc.split(', ')[0]),
                  eq(location.state_code, loc.split(', ')[1]),
               )
            ) || []),
            ...(query?.year?.map((year) => eq(submission.year, year)) || []),
            ...(query?.coop_year?.map((coop_year) => eq(submission.coop_year, coop_year)) || []),
            ...(query?.coop_cycle?.map((coop_cycle) => eq(submission.coop_cycle, coop_cycle)) || []),
            query?.program_level && eq(submission.program_level, query.program_level),
         ],
         skip: query?.skip ?? 0,
         limit: query?.limit ?? 10,
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
