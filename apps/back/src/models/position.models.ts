import { z, type ZodString } from 'zod';

export const name = (schema: ZodString) =>
   schema
      .trim()
      .min(3, { message: 'Name must be more than 3 characters' })
      .max(100, { message: 'Name must be less than 100 characters' });

export const CompanyPositionInsertSchema = z
   .object({
      company: name(z.string()),
      position: name(z.string()),
   })
   .meta({ id: 'CompanyPostionInsert' });

// Company schemas
export const CompanyInsertSchema = z
   .object({
      name: z.string().min(1, 'Company name is required'),
   })
   .meta({ id: 'CompanyInsert' });

export const CompanyCreateResponseSchema = z
   .object({
      company: z.object({
         id: z.string(),
         name: z.string(),
         owner_id: z.string().nullable(),
      }),
      message: z.string(),
   })
   .meta({ id: 'CompanyCreateResponse' });

// Position schemas
export const PositionInsertSchema = z
   .object({
      name: z.string().min(1, 'Position name is required'),
      company: z.string().min(1, 'Company is required'),
   })
   .meta({ id: 'PositionInsert' });

export const PositionItemSchema = z
   .object({
      id: z.string(),
      name: z.string(),
      company_id: z.string(),
      owner_id: z.string().nullable(),
   })
   .meta({ id: 'PositionItem' });

export const PositionCreateResponseSchema = z
   .object({
      position: PositionItemSchema,
      message: z.string(),
   })
   .meta({ id: 'PositionCreateResponse' });

export type CompanyPostionInsert = z.infer<typeof CompanyPositionInsertSchema>;
