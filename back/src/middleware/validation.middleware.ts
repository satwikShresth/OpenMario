import { Context, Next } from 'hono';
import { formatZodError } from '#utils';
import { db } from '#db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Custom middleware for Zod validation
// Note: This is a fallback in case you don't want to use @hono/zod-validator
export const zodValidator = (method: 'query' | 'json' | 'param', schema: z.ZodSchema) => {
   return async (c: Context, next: Next) => {
      let data;

      // Get data based on method
      if (method === 'query') {
         data = c.req.query();
      } else if (method === 'json') {
         data = await c.req.json().catch(() => ({}));
      } else if (method === 'param') {
         data = c.req.param();
      }

      // Parse with Zod
      const result = await schema.safeParseAsync(data);

      if (!result.success) {
         console.error(formatZodError(result.error).error);
         return c.json({
            type: method,
            errors: formatZodError(result.error).error,
         }, 400);
      }

      // Store validated data in the context
      c.set(`valid_${method}`, result.data);

      // Add helper method to retrieve validated data
      if (!c.req.valid) {
         c.req.valid = (key: string) => c.get(`valid_${key}`);
      }

      return next();
   };
};

export const zodBodyValidator = (schema: z.ZodSchema) => zodValidator('json', schema);
export const zodQueryValidator = (schema: z.ZodSchema) => zodValidator('query', schema);
export const zodParamsValidator = (schema: z.ZodSchema) => zodValidator('param', schema);

export const validateOwner = (table: any) => {
   return async (c: Context, next: Next) => {
      const current_user_id = c.get('jwtPayload')?.user_id;
      const item_id = c.req.valid('param')?.id || c.req.param('id');

      if (!current_user_id || !item_id) {
         return c.json({ message: 'Missing user ID or item ID' }, 400);
      }

      try {
         const result = await db
            .select({ user_id: table?.user_id! })
            .from(table)
            .where(eq(table.id, item_id));

         if (result.length === 0) {
            return c.json({ message: 'Item not found', detail: 'Item not found' }, 404);
         }

         if (result[0].user_id !== current_user_id) {
            return c.json({ message: 'Unauthorized Access' }, 401);
         }

         return next();
      } catch (error) {
         return c.json({
            message: error.message,
            detail: 'Item not found',
         }, 404);
      }
   };
};

export const validateUser = async (c: Context, next: Next) => {
   console.log('passing');
   console.log(c.get('jwtPayload'));

   if (c.get('jwtPayload')) {
      return next();
   }

   return c.json({ message: 'Unauthorized Access' }, 401);
};

