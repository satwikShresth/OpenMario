import { z } from 'zod';
export * from './authors.models.ts';
export * from './books.models.ts';

export interface RequestParamsId extends Request {
   params: {
      id: number;
   };
   validated?: {
      body?: any;
      params?: any;
      query?: any;
   };
}

export const paramsIdSchema = z.object({
   id: z.preprocess(
      (val) => Number(val),
      z.number().positive(),
   ),
});
