import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { jwt } from 'hono/jwt';
import type { JwtVariables } from 'hono/jwt';
import { showRoutes } from 'hono/dev';
import routes from '#routes';
import { JWT_CLIENT_SECRET as secret } from '#/config/index.ts';
import { db } from '#db';

// Create Hono app
const app = new Hono<{ Variables: JwtVariables }>();
const port = 3000;
const host = '0.0.0.0';
const protocol = 'http';

app.use('*', async (c, next) => {
   if (c.req.header('content-type') === 'application/json') {
      try {
         await next();
      } catch (error) {
         return c.json({ message: 'Invalid JSON' }, 400);
      }
   } else {
      await next();
   }
});

// Logger middleware (equivalent to morgan)
app.use('*', logger());

// Trust proxy configuration
// Note: Hono doesn't have a direct equivalent, but this can be handled in your deployment configuration

// Debug middleware
// Convert debugMiddlewares to Hono equivalent
if (Deno.env.get('NODE_ENV') !== 'production') {
   const { debugMiddlewares } = await import('#/utils/debug.ts');
   debugMiddlewares(app);
   showRoutes(app);
}

app.use('/v1/*', async (c, next) => {
   if (!c.req.header('Authorization')) {
      return next();
   }

   return jwt({
      secret,
      cookie: false,
   })(c, next);
});

// Mount routes
// This assumes routes() returns a Router or middleware function compatible with Hono
// You may need to modify your routes implementation
app.route('/v1', routes());

// 404 Handler
app.notFound((c) => {
   console.error(`Not Found: ${c.req.url}`);
   return c.json({ message: `Not Found: ${c.req.url}` }, 404);
});

// Error Handlers
app.onError((err, c) => {
   console.error(`Error: ${err}`);

   // JWT error handling
   if (err.message.includes('jwt')) {
      return c.json({ message: 'invalid token...' }, 401);
   }

   // General error handling
   const status = c.res.status < 400 ? 500 : c.res.status;
   console.error(`Error: ${err.message}`);
   return c.json({ message: err.message }, status);
});

console.log(`🚀 Server running on ${protocol}://${host}:${port}✨`);
Deno.serve(
   { port, hostname: '::' },
   app.fetch,
);
