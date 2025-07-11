import { z, ZodString } from 'zod/v4';

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
   .transform(({ company, position }) => ({
      company_name: company,
      position_name: position,
   }))
   .meta({ id: 'CompanyPostionInsert' });

export type CompanyPostionInsert = z.infer<typeof CompanyPositionInsertSchema>;
