import { oc } from '@orpc/contract';
import { z } from 'zod';

export const SubjectSchema = z
   .object({
      id: z
         .string()
         .describe(
            'Subject code used as the unique identifier (e.g. CS, MATH, ENGL)'
         ),
      name: z
         .string()
         .describe(
            'Full human-readable name of the subject (e.g. Computer Science)'
         )
   })
   .describe('A Drexel academic subject available for scraping');

export const listSubjectsContract = oc
   .route({
      method: 'GET',
      path: '/subjects',
      summary: 'List subjects from Neon DB',
      tags: ['Subjects']
   })
   .output(
      z
         .array(SubjectSchema)
         .describe('All available subjects stored in the database')
   );

export const subjectsContracts = {
   list: listSubjectsContract
};
