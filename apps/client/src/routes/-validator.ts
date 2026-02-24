import * as z from 'zod/mini';
import {
   coopCycle,
   coopYear,
   programLevel,
   queryFields,
   zodCheckUnique
} from '@/helpers';

export const year = z.coerce.number().check(
   z.nonnegative({ message: 'Amount cannot be negative' }),
   z.gte(2005, { message: 'Year cannot be before 2005' }),
   z.lte(new Date().getFullYear() + 1, {
      message: `Year cannot be after ${new Date().getFullYear() + 1}`
   })
);

export const salarySearchSchema = z.object({
   search: z.catch(
      z.optional(z.string().check(z.minLength(1), z.maxLength(200))),
      undefined
   ),
   year: z.catch(
      z.array(year).check(z.minLength(2), z.maxLength(2), zodCheckUnique),
      [2005, new Date().getFullYear()]
   ),
   coop_cycle: z.catch(
      z.optional(z.array(z.enum(coopCycle)).check(zodCheckUnique)),
      undefined
   ),
   sort: z.catch(z.enum(['ASC', 'DESC']), 'DESC'),
   sortField: z.catch(z.enum(queryFields), 'compensation'),
   coop_year: z.catch(
      z.optional(z.array(z.enum(coopYear)).check(zodCheckUnique)),
      undefined
   ),
   program_level: z.catch(z.enum(programLevel), 'Undergraduate'),
   distinct: z.catch(z.coerce.boolean(), true)
});

export type SalarySearchSchema = z.infer<typeof salarySearchSchema>;

export const submissionSchema = z.object({
   company: z
      .string()
      .check(
         z.trim(),
         z.minLength(3, { error: 'Name must be more than 3 characters' }),
         z.maxLength(100, { error: 'Name must be less than 100 characters' })
      ),
   position: z
      .string()
      .check(
         z.trim(),
         z.minLength(3, { error: 'Name must be more than 3 characters' }),
         z.maxLength(100, { error: 'Name must be less than 100 characters' })
      ),
   location: z.string(),
   work_hours: z
      .number()
      .check(
         z.nonnegative({ message: 'Amount cannot be negative' }),
         z.gte(5, { message: 'Amount must be greater than or equal to 5' }),
         z.lte(80, { message: 'Amount must be less than or equal to 80' })
      ),
   compensation: z
      .number()
      .check(z.nonnegative({ message: 'Amount cannot be negative' })),
   other_compensation: z.catch(
      z.optional(
         z.string().check(z.maxLength(255, 'Cannot be more than 255 characters'))
      ),
      ''
   ),
   details: z.catch(
      z.optional(
         z.string().check(z.maxLength(255, 'Cannot be more than 255 characters'))
      ),
      ''
   ),
   year,

   coop_year: z.enum(coopYear),
   coop_cycle: z.enum(coopCycle),
   program_level: z.enum(programLevel)
});

export type Submission = z.infer<typeof submissionSchema>;
