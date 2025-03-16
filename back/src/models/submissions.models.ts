import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { and, Column, eq, like, or, SQL, sql } from "drizzle-orm";
import * as undergrad from "#/db/undergraduate.data.ts";
import * as grad from "#/db/graduate.data.ts";
import {
  company,
  coop_cycle,
  coop_year,
  location,
  position,
  program_level,
  submission,
} from "#db";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { name } from "#/models/position.models.ts";

extendZodWithOpenApi(z);

export const compensation = (schema: any) =>
  schema
    .nonnegative({ message: "Amount cannot be negative" })
    .openapi({ description: "Compensation amount", example: 100 });

export const year = (schema: any) =>
  schema
    .int()
    .nonnegative({ message: "Amount cannot be negative" })
    .min(2005, { message: "Year cannot be before 2005" })
    .refine((year: any) => year <= new Date().getFullYear() + 1, {
      message: `Year must be between 2004 and ${new Date().getFullYear() + 2}`,
    })
    .openapi({
      description: "Submission Year",
      example: new Date().getFullYear(),
    });

export const work_hours = (schema: any) =>
  schema
    .int({ message: "Amount must be an integer" })
    .nonnegative({ message: "Amount cannot be negative" })
    .min(5, { message: "Amount must be greater than or equal to 5" })
    .max(60, { message: "Amount must be less than or equal to 60" })
    .openapi({ description: "Expected Work Hours", example: 40 });

export const parseOptionalInt = (name: string, min: number, max?: number) =>
  z.coerce
    .number()
    .int(`${name} must be an integer`)
    .min(min, `${name} must be at least ${min}`)
    .max(max ?? Infinity, max ? `${name} cannot exceed ${max}` : "")
    .optional();

const ensureArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (Array.isArray(val) ? val : [val]), z.array(schema));

export const SubmissionQuerySchema = z.object({
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
  pageIndex: parseOptionalInt("pageIndex", 0),
  pageSize: parseOptionalInt("pageSize", 1, 100),
  distinct: z.preprocess((val) => val === "true", z.boolean()).default(true),
});

export const querySQL = (column: Column, matchValue?: string): SQL =>
  matchValue &&
  sql`(
    to_tsvector('english', ${column}) @@ to_tsquery('english', ${matchValue
      .trim()
      .split(/\s+/)
      .map((term) => `${term}:*`)
      .join(" & ")})
    OR ${column} % ${matchValue.trim()}
    OR ${column} ILIKE ${matchValue.trim().toLowerCase().split("").join("%") + "%"}
  )`;

export const orderSQL = (column: Column, matchValue?: string) =>
  matchValue &&
  sql`(
    (CASE WHEN lower(${column}) ILIKE ${matchValue
      .trim()
      .toLowerCase()
      .split("")
      .reduce(
        (pattern, char, idx) =>
          idx === 0 ? char + "%" : pattern + " " + char + "%",
        "",
      )} THEN 1 ELSE 0 END) * 10000
    + similarity(${column}, ${matchValue.trim()})
  ) DESC`;

export const SubmissionQuery = SubmissionQuerySchema.transform(
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

    const companyQueries: SQL[] = query?.company?.map((companyName) =>
      eq(company.name, companyName),
    );
    if (companyQueries?.length!) {
      queries.push(or(...companyQueries)!);
    }

    const positionQueries = query?.position?.map((position_) =>
      querySQL(position.name, position_),
    );
    if (positionQueries?.length) {
      queries.push(or(...positionQueries)!);
    }

    // Location queries
    const locationQueries = query?.location?.map((loc) =>
      and(
        eq(location.city, loc.split(", ")[0]),
        eq(location.state_code, loc.split(", ")[1]),
      ),
    );
    if (locationQueries?.length) {
      queries.push(or(...locationQueries)!);
    }

    const range = (start, end) => {
      if (start === end) {
        return [start];
      }
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };
    const yearQueries =
      query?.year &&
      range(query?.year[0], query?.year[1])?.map((year) =>
        eq(submission.year, year),
      );

    if (yearQueries?.length) {
      queries.push(or(...yearQueries)!);
    }

    // Coop year queries
    const coopYearQueries = query?.coop_year?.map((coop_year) =>
      eq(submission.coop_year, coop_year),
    );
    if (coopYearQueries?.length) {
      queries.push(or(...coopYearQueries)!);
    }

    // Coop cycle queries
    const coopCycleQueries = query?.coop_cycle?.map((coop_cycle) =>
      eq(submission.coop_cycle, coop_cycle),
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
      skip: query?.pageIndex * query?.pageSize ?? 0,
      limit: query?.pageSize ?? 10,
      distinct: !!query?.distinct,
    };
  },
);

export const SubmissionAggregateSchema = z.object({
  company: name(z.string()),
  position: name(z.string()),
  location: z.string(),
  work_hours: z.preprocess((val) => Number(val), work_hours(z.number())),
  compensation: compensation(z.number()),
  other_compensation: z.string().max(255, "Cannot be more than 255 characters"),
  details: z.string().max(255, "Cannot be more than 255 characters"),
  year: z.preprocess((year) => Number(year), year(z.number())),
  coop_year: z.enum(coop_year),
  coop_cycle: z.enum(coop_cycle),
  program_level: z.enum(program_level),
});

export const SubmissionAggregateUpdateSchema = SubmissionAggregateSchema.extend(
  {
    id: z
      .string({ required_error: "Needs id to update entry" })
      .uuid()
      .readonly(),
  },
);

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

export const SubmissionMeIdsSchema = z.object({
  ids: ensureArray(z.string().uuid()).optional(),
});

export const SubmissionSchema = createSelectSchema(submission);

export const SubmissionInsertSchema = createInsertSchema(submission, {
  work_hours,
  year,
  compensation,
});
export const SubmissionUpdateSchema = createUpdateSchema(submission, {
  work_hours,
  year,
  compensation,
});

export type SubmissionMeIds = z.infer<typeof SubmissionMeIdsSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type SubmissionInsert = z.infer<typeof SubmissionInsertSchema>;
export type SubmissionUpdate = z.infer<typeof SubmissionUpdateSchema>;
export type SubmissionAggregateUpdate = z.infer<
  typeof SubmissionAggregateUpdateSchema
>;
export type SubmissionAggregate = z.infer<typeof SubmissionAggregateSchema>;
export type SubmissionQuery = z.infer<typeof SubmissionQuery>;
export type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;
