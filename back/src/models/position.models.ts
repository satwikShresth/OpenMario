import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { company, position } from "#/db/schema.ts";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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

export type CompanyPostionInsert = z.infer<typeof CompanyPositionInsertSchema>;

export const CompanySchema = createSelectSchema(company);
export type Company = z.infer<typeof CompanySchema>;

export const CompanyInsertSchema = createInsertSchema(company, { name });
export type CompanyInsert = z.infer<typeof CompanyInsertSchema>;

export const PositionSchema = createSelectSchema(position);
export type Position = z.infer<typeof PositionSchema>;

export const PositionInsertSchema = createInsertSchema(position, { name });
export type PositionInsert = z.infer<typeof PositionInsertSchema>;
