import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { compensation } from '#/db/schema.ts';
import {
   createInsertSchema,
   createSelectSchema,
   createUpdateSchema,
} from 'drizzle-zod';

extendZodWithOpenApi(z);

export const amount = (schema: z.ZodNumber) =>
   schema
      .int({ message: 'Amount must be an integer' })
      .nonnegative({ message: 'Amount cannot be negative' })
      .max(120, { message: 'Amount must be less than or equal to 120' })
      .openapi({
         description: 'Compensation amount',
         example: 100,
      });

export const CompensationSchema = createSelectSchema(compensation);
export const CompensationInsertSchema = createInsertSchema(
   compensation,
   { amount },
)
   .strict()
   .openapi({
      title: 'CompensationCreate',
      description: 'Schema for creating a new compensation record',
   });

export const CompensationUpdateSchema = createUpdateSchema(
   compensation,
   { amount },
)
   .strict()
   .openapi({
      title: 'CompensationUpdate',
      description: 'Schema for updating an existing compensation record',
   });

export type Compensation = z.infer<typeof CompensationSchema>;
export type CompensationInsert = z.infer<typeof CompensationInsertSchema>;
export type CompensationUpdate = z.infer<typeof CompensationUpdateSchema>;
