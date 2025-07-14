import { z, type ZodNumber } from "zod";
import { type Column, type SQL, sql } from "drizzle-orm";
import { coop_cycle, coop_year, program_level, submission } from "#db";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { name } from "#/models/position.models.ts";

export const compensation = (schema: ZodNumber) =>
  schema.nonnegative({ message: "Amount cannot be negative" });

export const year = (schema: ZodNumber) =>
  schema
    .int()
    .nonnegative({ message: "Amount cannot be negative" })
    .min(2005, { message: "Year cannot be before 2005" })
    .refine((year: number) => year <= new Date().getFullYear() + 1, {
      message: `Year must be between 2004 and ${new Date().getFullYear() + 2}`,
    });

export const work_hours = (schema: ZodNumber) =>
  schema
    .int({ message: "Amount must be an integer" })
    .nonnegative({ message: "Amount cannot be negative" })
    .min(5, { message: "Amount must be greater than or equal to 5" })
    .max(60, { message: "Amount must be less than or equal to 60" });

export const parseOptionalInt = (name: string, min: number, max?: number) =>
  z.coerce
    .number()
    .int(`${name} must be an integer`)
    .min(min, `${name} must be at least ${min}`)
    .max(max ?? Infinity, max ? `${name} cannot exceed ${max}` : "")
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
          OR ${column} ILIKE ${matchValue.trim().toLowerCase().split("").join("%") + "%"}
        )`
    : undefined;

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
    pageIndex: parseOptionalInt("pageIndex", 0),
    pageSize: parseOptionalInt("pageSize", 1, 100),
    distinct: z.preprocess((val) => val === "true", z.boolean()).default(true),
  })
  .meta({
    param: { in: "query", name: "SubmissionQuery", id: "SubmissionQueryRef" },
  });

export const SubmissionAggregateSchema = z
  .object({
    company: name(z.string()),
    position: name(z.string()),
    location: z.string(),
    work_hours: z.preprocess((val) => Number(val), work_hours(z.number())),
    compensation: compensation(z.number()),
    other_compensation: z
      .string()
      .max(255, "Cannot be more than 255 characters"),
    details: z.string().max(255, "Cannot be more than 255 characters"),
    year: z.preprocess((year) => Number(year), year(z.number())),
    coop_year: z.enum(coop_year),
    coop_cycle: z.enum(coop_cycle),
    program_level: z.enum(program_level),
  })
  .meta({ id: "SubmissionAggregate" });

export const SubmissionAggregateUpdateSchema = SubmissionAggregateSchema.extend(
  {
    id: z.uuid().readonly(),
  },
).meta({ id: "SubmissionAggregateUpdate" });

export const SubmissionMeIdsSchema = z
  .object({
    ids: ensureArray(z.uuid()).optional(),
  })
  .meta({
    param: {
      in: "query",
      name: "SubmissionMeIdQuery",
      id: "SubmissionMeIdQueryRef",
    },
  });

export const SubmissionSchema = createSelectSchema(submission).meta({
  id: "Submission",
});

export const SubmissionInsertSchema = createInsertSchema(submission).meta({
  id: "SubmissionInsert",
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
  .meta({ id: "SubmissionItem" });

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
  .meta({ id: "SubmissionListItem" });

export const SubmissionListResponseSchema = z
  .object({
    pageIndex: z.number(),
    pageSize: z.number(),
    count: z.number(),
    data: z.array(SubmissionListItemSchema),
  })
  .meta({ id: "SubmissionListResponse" });

export const SubmissionMeResponseSchema = z
  .object({
    data: z.array(SubmissionItemSchema),
  })
  .meta({ id: "SubmissionMeResponse" });

export const SubmissionCreateResponseSchema = z
  .object({
    id: z.string(),
    owner_id: z.string().nullable(),
    message: z.string(),
  })
  .meta({ id: "SubmissionCreateResponse" });

export const SubmissionUpdateResponseSchema = z
  .object({
    message: z.string(),
  })
  .meta({ id: "SubmissionUpdateResponse" });

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
