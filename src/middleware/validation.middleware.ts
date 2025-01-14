import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { formatZodError } from '#utils';

const zodValidator =
   (method: 'query' | 'body' | 'params', schema: z.ZodTypeAny) =>
   async (
      req: Request,
      res: Response,
      next: NextFunction,
   ) => {
      const result = await schema.safeParseAsync(req[method]);

      if (!result.success) {
         return res.status(400).send({
            type: method,
            errors: formatZodError(result.error).error,
         });
      }

      req[method] = result.data;
      next();
   };

export const zodBodyValidator = (schema: z.ZodTypeAny) =>
   zodValidator('body', schema);

export const zodQueryValidator = (schema: z.ZodTypeAny) =>
   zodValidator('query', schema);

export const zodParamsValidator = (schema: z.ZodTypeAny) =>
   zodValidator('params', schema);
