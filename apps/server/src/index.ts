import { Hono } from 'hono';
import { Scalar } from '@scalar/hono-api-reference';
import { logger } from 'hono/logger';
import { env } from '@env';
import { cors } from 'hono/cors';
import { auth, handler, specs, CORS_OPTIONS } from '@/utils';

const app = new Hono({
   strict: false
})
   .use('*', cors(CORS_OPTIONS))
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
