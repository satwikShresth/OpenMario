import { z } from 'zod';
import { Request } from 'express-jwt';
import { JwtPayload } from '#/models/auth.models.ts';

export type RequestParamsId = Request & {
   auth?: JwtPayload;
   params?: {
      id: number;
   };
   validated?: {
      body?: any;
      params?: any;
      query?: any;
   };
};

export const paramsIdSchema = z.object({
   id: z.preprocess((val) => Number(val), z.number().positive()),
});

export type ParamsId = z.infer<typeof paramsIdSchema>;
export * from '#/models/enums.models.ts';
export * from '#/models/auth.models.ts';
export * from '#/models/submissions.models.ts';
export * from '#/models/position.models.ts';
