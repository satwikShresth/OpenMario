import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { company, position } from '#/db/schema.ts';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

extendZodWithOpenApi(z);

export const name = (schema: any) =>
   schema
      .trim()
      .min(3, { message: 'Name must be more than 3 characters' })
      .max(100, { message: 'Name must be less than 100 characters' })
      .regex(
         /^[a-zA-Z\s\-'\p{L}\p{M}]+$/u,
         { message: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods' },
      );

export const CompanySchema = createSelectSchema(company);
export type Company = z.infer<typeof CompanySchema>;

export const CompanyInsertSchema = createInsertSchema(company, { name });
export type CompanyInsert = z.infer<typeof CompanyInsertSchema>;

export const CompanyUpdateSchema = createUpdateSchema(company, { name });
export type CompanyUpdate = z.infer<typeof CompanyUpdateSchema>;

export const PositionSchema = createSelectSchema(position);
export type Position = z.infer<typeof PositionSchema>;

export const PositionInsertSchema = createInsertSchema(position, { name });
export type PositionInsert = z.infer<typeof PositionInsertSchema>;

export const PositionUpdateSchema = createUpdateSchema(position, { name });
export type PositionUpdate = z.infer<typeof PositionUpdateSchema>;
