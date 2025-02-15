import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { submission, submission_major, submission_minor } from '#/db/schema.ts';
import {
   createInsertSchema,
   createSelectSchema,
   createUpdateSchema,
} from 'drizzle-zod';

extendZodWithOpenApi(z);

export const year = (schema: z.ZodNumber) =>
   schema
      .int()
      .nonnegative({ message: 'Amount cannot be negative' })
      .min(2005, { message: 'Year cannot be before 2005' })
      .refine(
         (year) => year <= new Date().getFullYear() + 1,
         {
            message: `Year must be between 2004 and ${
               new Date().getFullYear() + 2
            }`,
         },
      )
      .openapi({
         description: 'Submission Year',
         example: new Date().getFullYear(),
      });

export const work_hours = (schema: z.ZodNumber) =>
   schema
      .int({ message: 'Amount must be an integer' })
      .nonnegative({ message: 'Amount cannot be negative' })
      .min(5, { message: 'Amount must be greater than or equal to 5' })
      .max(60, { message: 'Amount must be less than or equal to 60' })
      .openapi({
         description: 'Expected Work Hours',
         example: 40,
      });

export const SubmissionSchema = createSelectSchema(submission);
export const SubmissionMinorSchema = createSelectSchema(submission_minor, {});
export const SubmissionMajorSchema = createSelectSchema(submission_major);

export const SubmissionInsertSchema = createInsertSchema(
   submission,
   { work_hours, year },
);
export const SubmissionUpdateSchema = createUpdateSchema(
   submission,
   { work_hours, year },
);

export const SubmissionMajorInsertSchema = createInsertSchema(submission_major);
export const SubmissionMajorUpdateSchema = createUpdateSchema(submission_major);

export const SubmissionMinorInsertSchema = createInsertSchema(submission_minor);
export const SubmissionMinorUpdateSchema = createUpdateSchema(submission_minor);

export type Submission = z.infer<typeof SubmissionSchema>;
export type SubmissionInsert = z.infer<typeof SubmissionInsertSchema>;
export type SubmissionUpdate = z.infer<typeof SubmissionUpdateSchema>;

export type SubmissionMajor = z.infer<typeof SubmissionMajorSchema>;
export type SubmissionMajorInsert = z.infer<typeof SubmissionMajorInsertSchema>;
export type SubmissionMajorUpdate = z.infer<typeof SubmissionMajorUpdateSchema>;

export type SubmissionMinor = z.infer<typeof SubmissionMinorSchema>;
export type SubmissionMinorInsert = z.infer<typeof SubmissionMinorInsertSchema>;
export type SubmissionMinorUpdate = z.infer<typeof SubmissionMinorUpdateSchema>;
