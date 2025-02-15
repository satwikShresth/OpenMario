import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import {
   compensation_types,
   coop_cycle,
   coop_year,
   program_level,
} from '#/db/schema.ts';
import { name } from '#/models/position.models.ts';
import { work_hours, year } from '#/models/submissions.models.ts';
import * as undergrad from './undergradute.model.ts';
import * as grad from './graduate.model.ts';
import { amount } from '#/models/compensation.models.ts';

extendZodWithOpenApi(z);

const compensation = z.object({
   type: z.enum(compensation_types),
   amount: z
      .preprocess(
         (val) => Number(val),
         amount(z.number()),
      ),
   description: z
      .string()
      .trim()
      .max(250, { message: 'Name must be less than 100 characters' })
      .regex(
         /^[a-zA-Z\d\s\-'\p{L}\p{M}]+$/u,
         {
            message:
               'Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods',
         },
      )
      .optional(),
   isNotApplicable: z
      .preprocess(
         (val) => val === 'true' || val === true,
         z.boolean(),
      ),
});

export const SubmissionAggregate = z.object({
   company: name(z.string()),
   position: name(z.string()),
   location: z
      .string()
      .regex(/^[^,]+,\s*[^,]+$/),
   work_hours: z.preprocess(
      (val) => Number(val),
      work_hours(z.number()),
   ),
   year: z.preprocess(
      (year) => Number(year),
      year(z.number()),
   ),
   compensations: z.array(compensation),
   coop_year: z.enum(coop_year),
   coop_cycle: z.enum(coop_cycle),
   level: z.enum(program_level),
   majors: z.array(
      z.enum(
         [...undergrad.Majors, ...grad.Majors],
      ),
   ).min(1),
   minors: z.array(
      z.enum(
         [...undergrad.Minors, ...grad.Minors],
      ),
   ).optional().default([]),
});
