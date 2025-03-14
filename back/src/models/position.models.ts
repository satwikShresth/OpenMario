import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { company, position } from "#/db/schema.ts";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { ZodTypeAny } from "zod";

extendZodWithOpenApi(z);

export const name = (schema: any): ZodTypeAny =>
  schema
    .trim()
    .min(3, { message: "Name must be more than 3 characters" })
    .max(100, { message: "Name must be less than 100 characters" });

export const CompanyPositionInsertSchema = z
  .object({
    company: name(z.string()),
    position: name(z.string()),
  })
  .transform(({ company, position }) => ({
    company_name: company,
    position_name: position,
  }));

export const PositionUpdateSchema = z
  .object({
    position_id: z.string().uuid(),
    position: name(z.string()),
  })
  .transform(({ position_id, position }) => ({
    position_id,
    position_name: position,
  }));

export const CompanyUpdateSchema = z
  .object({
    company_id: z.string().uuid(),
    company: name(z.string()),
  })
  .transform(({ company_id, company }) => ({
    company_id,
    company_name: company,
  }));

export type CompanyPostionInsert = z.infer<typeof CompanyPositionInsertSchema>;
export type CompanyPostionUpdate = z.infer<typeof CompanyPositionUpdateSchema>;

export const CompanySchema = createSelectSchema(company);
export type Company = z.infer<typeof CompanySchema>;

export const CompanyInsertSchema = createInsertSchema(company, { name });
export type CompanyInsert = z.infer<typeof CompanyInsertSchema>;

export const PositionSchema = createSelectSchema(position);
export type Position = z.infer<typeof PositionSchema>;

export const PositionInsertSchema = createInsertSchema(position, { name });
export type PositionInsert = z.infer<typeof PositionInsertSchema>;

export type PositionUpdate = z.infer<typeof PositionUpdateSchema>;
export type CompanyUpdate = z.infer<typeof CompanyUpdateSchema>;
