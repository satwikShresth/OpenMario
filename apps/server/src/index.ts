import { Hono } from 'hono';
import { Scalar } from '@scalar/hono-api-reference';
import { logger } from 'hono/logger';
import { env } from '@env';
import { cors } from 'hono/cors';
import { router } from '@/router';
import { onError, ORPCError, ValidationError } from '@orpc/server';
import { ZodSmartCoercionPlugin } from '@orpc/zod';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { auth, specs } from '@/utils';
import z from 'zod';

const handler = new OpenAPIHandler(router, {
   plugins: [new ZodSmartCoercionPlugin()],
   interceptors: [
      onError(error => {
         console.log(error);
         if (
            error instanceof ORPCError &&
            error.code === 'BAD_REQUEST' &&
            error.cause instanceof ValidationError
         ) {
            // If you only use Zod you can safely cast to ZodIssue[]
            const zodError = new z.ZodError(
               error.cause.issues as z.core.$ZodIssue[]
            );

            throw new ORPCError('INPUT_VALIDATION_FAILED', {
               status: 422,
               message: z.prettifyError(zodError),
               data: z.flattenError(zodError),
               cause: error.cause
            });
         }

         if (
            error instanceof ORPCError &&
            error.code === 'INTERNAL_SERVER_ERROR' &&
            error.cause instanceof ValidationError
         ) {
            // If you only use Zod you can safely cast to ZodIssue[]
            const zodError = new z.ZodError(
               error.cause.issues as z.core.$ZodIssue[]
            );

            console.log(z.prettifyError(zodError));
            throw new ORPCError('OUTPUT_VALIDATION_FAILED', {
               cause: error.cause
            });
         }
      })
   ]
});

const app = new Hono({
   strict: false
})
   .use(
      '*',
      cors({
         origin: 'http://localhost:*',
         allowHeaders: ['Content-Type', 'Authorization'],
         allowMethods: ['POST', 'GET', 'OPTIONS'],
         exposeHeaders: ['Content-Length'],
         maxAge: 600,
         credentials: true
      })
   )
   .on(['POST', 'GET'], '/api/auth/*', c => auth.handler(c.req.raw))
   .get('/api/openapi.json', c => c.json(specs))
   .get(
      '/api/docs',
      Scalar({
         pageTitle: 'API Documentation',
         sources: [
            { url: '/api/openapi.json', title: 'API' },
            // Better Auth schema generation endpoint
            { url: '/api/auth/open-api/generate-schema', title: 'Auth' }
         ]
      })
   )
   .use('*', logger())
   .get('/api/health', c => c.json({ status: 'ok', application: 'openmario' }))
   .use(
      '/api/*',
      async (c, next) =>
         await handler
            .handle(c.req.raw, {
               prefix: '/api',
               context: {
                  headers: c.req.raw.headers
               }
            })
            .then(async ({ matched, response }) =>
               matched ? c.newResponse(response.body, response) : await next()
            )
   );

export default {
   port: env.PORT,
   fetch: app.fetch
};
