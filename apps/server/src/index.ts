import { Hono } from 'hono';
import { Scalar } from '@scalar/hono-api-reference';
import { logger } from 'hono/logger';
import { env } from '@env';
import { cors } from 'hono/cors';
import { router } from '@/router';
import { onError } from '@orpc/server';
import { ZodSmartCoercionPlugin } from '@orpc/zod';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { specs } from '@/utils';

const handler = new OpenAPIHandler(router, {
   plugins: [new ZodSmartCoercionPlugin()],
   interceptors: [
      onError(error => {
         console.error('RPC Error:', error);
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
   .get('/api/openapi.json', c => c.json(specs))
   .get(
      '/api/docs',
      Scalar({
         pageTitle: 'API Documentation',
         url: '/openapi.json'
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
               context: {}
            })
            .then(async ({ matched, response }) =>
               matched ? c.newResponse(response.body, response) : await next()
            )
   );
export default {
   port: env.PORT,
   fetch: app.fetch
};
