import { COOP_CYCLES, COOP_ROUND, COOP_YEARS, PROGRAM_LEVELS } from "#/types";
import { fallback } from '@tanstack/zod-adapter'
import { z } from "zod";

export const name = (schema: any) =>
  schema
    .trim()
    .min(3, { message: 'Name must be more than 3 characters' })
    .max(100, { message: 'Name must be less than 100 characters' })

export const compensation = (schema: any) =>
  schema
    .nonnegative({ message: 'Amount cannot be negative' });

export const year = (schema: any) =>
  schema
    .int()
    .nonnegative({ message: 'Amount cannot be negative' })
    .min(2005, { message: 'Year cannot be before 2005' })
    .refine(
      (year: any) => year <= new Date().getFullYear() + 1,
      { message: `Year must be between 2004 and ${new Date().getFullYear() + 2}` },
    );

export const work_hours = (schema: any) =>
  schema
    .int({ message: 'Amount must be an integer' })
    .nonnegative({ message: 'Amount cannot be negative' })
    .min(5, { message: 'Amount must be greater than or equal to 5' })
    .max(60, { message: 'Amount must be less than or equal to 60' });


export const CompanyPositionSchema = z.object({
  company: name(z.string()),
  position: name(z.string()),
});

export const PositionSchema = z.object({
  company: name(z.string()),
  position: name(z.string()),
  location: z.string().regex(/^[A-Za-z\s.-]+,\s*[A-Z]{2}$/),
  work_hours: z.preprocess((val) => Number(val), work_hours(z.number()),),
  compensation: compensation(z.number()),
  other_compensation: z.string().max(255, 'Cannot be more than 255 characters'),
  details: z.string().max(255, 'Cannot be more than 255 characters'),
  year: z.preprocess((year) => Number(year), year(z.number())),
  coop_year: z.enum(COOP_YEARS),
  coop_cycle: z.enum(COOP_CYCLES),
  program_level: z.enum(PROGRAM_LEVELS),
});

export type Position = z.infer<typeof PositionSchema>;


const ensureArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (val) => (Array.isArray(val) ? val : [val]),
    z.array(schema),
  );

export const FilterSchema = z.object({
  company: ensureArray(z.string()).optional(),
  position: ensureArray(z.string()).optional(),
  location: ensureArray(z.string()).optional(),
  year: z.preprocess((year) => String(year).split(',').map(year => Number(year)), z.array(year(z.number().min(2005))).max(2).min(2)).optional(),
  coop_year: ensureArray(z.enum(COOP_YEARS)).optional(),
  coop_cycle: ensureArray(z.enum(COOP_CYCLES)).optional(),
  program_level: z.enum(PROGRAM_LEVELS).optional(),
  distinct: z.preprocess((val) => val === 'true', z.boolean()).optional(),
});


export type Filter = z.infer<typeof FilterSchema>;


export const UploadSchema = z.object({
  year: z.preprocess((year) => Number(year), year(z.number().min(2005))),
  coop_year: z.enum(COOP_YEARS),
  coop_cycle: z.enum(COOP_CYCLES),
  coop_round: z.enum(COOP_ROUND),
  program_level: z.enum(PROGRAM_LEVELS),
});

export type Upload = z.infer<typeof UploadSchema>;
