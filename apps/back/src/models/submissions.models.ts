import { z, ZodNumber } from 'zod';
import { and, Column, eq, or, SQL, sql } from 'drizzle-orm';
import { company, coop_cycle, coop_year, location, position, program_level, submission } from '#db';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { name } from '#/models/position.models.ts';

export const compensation = (schema: ZodNumber) =>
   schema.nonnegative({ message: 'Amount cannot be negative' });

export const year = (schema: ZodNumber) =>
   schema
      .int()
      .nonnegative({ message: 'Amount cannot be negative' })
      .min(2005, { message: 'Year cannot be before 2005' })
      .refine((year: number) => year <= new Date().getFullYear() + 1, {
         message: `Year must be between 2004 and ${new Date().getFullYear() + 2}`,
      });

export const work_hours = (schema: ZodNumber) =>
   schema
      .int({ message: 'Amount must be an integer' })
      .nonnegative({ message: 'Amount cannot be negative' })
      .min(5, { message: 'Amount must be greater than or equal to 5' })
      .max(60, { message: 'Amount must be less than or equal to 60' });

export const parseOptionalInt = (name: string, min: number, max?: number) =>
   z.coerce
      .number()
      .int(`${name} must be an integer`)
      .min(min, `${name} must be at least ${min}`)
      .max(max ?? Infinity, max ? `${name} cannot exceed ${max}` : '')
      .optional();

const ensureArray = <T extends z.ZodTypeAny>(schema: T) =>
   z.preprocess((val) => (Array.isArray(val) ? val : [val]), z.array(schema));

export const querySQL = (
   column: Column,
   matchValue?: string,
): SQL | undefined =>
   matchValue
      ? sql`(
          to_tsvector('english', ${column}) @@ plainto_tsquery('english', ${matchValue.trim()})
          OR ${column} % ${matchValue.trim()}
          OR ${column} ILIKE ${matchValue.trim().toLowerCase().split('').join('%') + '%'}
        )`
      : undefined;

export const orderSQL = (column: Column, matchValue?: string) =>
   matchValue &&
   sql`(
    (CASE WHEN lower(${column}) ILIKE ${
      matchValue
         .trim()
         .toLowerCase()
         .split('')
         .reduce(
            (pattern, char, idx) => idx === 0 ? char + '%' : pattern + ' ' + char + '%',
            '',
         )
   } THEN 1 ELSE 0 END) * 10000
    + similarity(${column}, ${matchValue.trim()})
  ) DESC`;

export const SubmissionQuerySchema = z
   .object({
      company: ensureArray(name(z.string())).optional(),
      position: ensureArray(name(z.string())).optional(),
      location: ensureArray(
         z.string().regex(/^[A-Za-z\s.-]+,\s*[A-Z]{2}$/),
      ).optional(),
      year: ensureArray(
         z.preprocess((year) => Number(year), z.number()),
      ).optional(),
      coop_year: ensureArray(z.enum(coop_year)).optional(),
      coop_cycle: ensureArray(z.enum(coop_cycle)).optional(),
      program_level: z.enum(program_level).optional(),
      pageIndex: parseOptionalInt('pageIndex', 0),
      pageSize: parseOptionalInt('pageSize', 1, 100),
      distinct: z.preprocess((val) => val === 'true', z.boolean()).default(true),
   })
   .transform(
      (
         query,
      ): {
         companyQuery?: SQL[];
         positionQuery?: SQL[];
         query?: SQL[];
         pageIndex?: number;
         skip?: number;
         limit?: number;
         distinct?: boolean;
      } => {
         const queries: SQL[] = [];

         const companyQueries: SQL[] | undefined = query?.company?.map(
            (companyName) => eq(company.name, companyName),
         );
         if (companyQueries?.length!) {
            queries.push(or(...companyQueries)!);
         }

         const positionQueries = query?.position?.map((position_) =>
            querySQL(position.name, position_)
         );
         if (positionQueries?.length) {
            queries.push(or(...positionQueries)!);
         }

         // Location queries
         const locationQueries = query?.location?.map((loc) =>
            and(
               eq(location.city, loc.split(', ')[0]),
               eq(location.state_code, loc.split(', ')[1]),
            )
         );
         if (locationQueries?.length) {
            queries.push(or(...locationQueries)!);
         }

         const range = (start: number, end: number) => {
            if (start === end) {
               return [start];
            }
            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
         };

         const yearQueries = query?.year &&
            range(query?.year[0], query?.year[1])?.map((year) => eq(submission.year, year));

         if (yearQueries?.length) {
            queries.push(or(...yearQueries)!);
         }

         // Coop year queries
         const coopYearQueries = query?.coop_year?.map((coop_year) =>
            eq(submission.coop_year, coop_year)
         );
         if (coopYearQueries?.length) {
            queries.push(or(...coopYearQueries)!);
         }

         // Coop cycle queries
         const coopCycleQueries = query?.coop_cycle?.map((coop_cycle) =>
            eq(submission.coop_cycle, coop_cycle)
         );
         if (coopCycleQueries?.length) {
            queries.push(or(...coopCycleQueries)!);
         }

         // Program level query
         if (query?.program_level) {
            queries.push(eq(submission.program_level, query.program_level));
         }

         return {
            query: queries,
            pageIndex: query?.pageIndex,
            skip: query?.pageIndex! * query?.pageSize! || 0,
            limit: query?.pageSize ?? 10,
            distinct: !!query?.distinct,
         };
      },
   )
   .meta({ id: 'SubmissionQuery' });

export const SubmissionAggregateSchema = z
   .object({
      company: name(z.string()),
      position: name(z.string()),
      location: z.string(),
      work_hours: z.preprocess((val) => Number(val), work_hours(z.number())),
      compensation: compensation(z.number()),
      other_compensation: z
         .string()
         .max(255, 'Cannot be more than 255 characters'),
      details: z.string().max(255, 'Cannot be more than 255 characters'),
      year: z.preprocess((year) => Number(year), year(z.number())),
      coop_year: z.enum(coop_year),
      coop_cycle: z.enum(coop_cycle),
      program_level: z.enum(program_level),
   })
   .meta({ id: 'SubmissionAggregate' });

export const SubmissionAggregateUpdateSchema = SubmissionAggregateSchema.extend(
   {
      id: z.uuid().readonly(),
   },
).meta({ id: 'SubmissionAggregateUpdate' });

export const SubmissionMeIdsSchema = z
   .object({
      ids: ensureArray(z.uuid()).optional(),
   })
   .meta({ id: 'SubmissionMeIds' });

export const SubmissionSchema = createSelectSchema(submission).meta({
   id: 'Submission',
});

export const SubmissionInsertSchema = createInsertSchema(submission).meta({
   id: 'SubmissionInsert',
});

// Response schemas for OpenAPI documentation
export const SubmissionItemSchema = z
   .object({
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
      location: z.string(),
   })
   .meta({ id: 'SubmissionItem' });

export const SubmissionListItemSchema = z
   .object({
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
   })
   .meta({ id: 'SubmissionListItem' });

export const SubmissionListResponseSchema = z
   .object({
      pageIndex: z.number(),
      pageSize: z.number(),
      count: z.number(),
      data: z.array(SubmissionListItemSchema),
   })
   .meta({ id: 'SubmissionListResponse' });

export const SubmissionMeResponseSchema = z
   .object({
      data: z.array(SubmissionItemSchema),
   })
   .meta({ id: 'SubmissionMeResponse' });

export const SubmissionCreateResponseSchema = z
   .object({
      id: z.string(),
      owner_id: z.string().nullable(),
      message: z.string(),
   })
   .meta({ id: 'SubmissionCreateResponse' });

export const SubmissionUpdateResponseSchema = z
   .object({
      message: z.string(),
   })
   .meta({ id: 'SubmissionUpdateResponse' });

// Type exports
export type SubmissionMeIds = z.infer<typeof SubmissionMeIdsSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type SubmissionInsert = z.infer<typeof SubmissionInsertSchema>;
export type SubmissionAggregateUpdate = z.infer<
   typeof SubmissionAggregateUpdateSchema
>;
export type SubmissionAggregate = z.infer<typeof SubmissionAggregateSchema>;
export type SubmissionQuery = z.infer<typeof SubmissionQuerySchema>;
export type SubmissionItem = z.infer<typeof SubmissionItemSchema>;
export type SubmissionListItem = z.infer<typeof SubmissionListItemSchema>;
export type SubmissionListResponse = z.infer<
   typeof SubmissionListResponseSchema
>;
export type SubmissionMeResponse = z.infer<typeof SubmissionMeResponseSchema>;
export type SubmissionCreateResponse = z.infer<
   typeof SubmissionCreateResponseSchema
>;
export type SubmissionUpdateResponse = z.infer<
   typeof SubmissionUpdateResponseSchema
>;
