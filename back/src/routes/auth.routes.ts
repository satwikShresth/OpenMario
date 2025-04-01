import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { emailService } from '#/services/mail.service.ts';
import { LoginSchema } from '#models';
import { db, users } from '#db';
import * as config from '#/config/index.ts';
import { eq } from 'drizzle-orm';
import { sign, verify } from 'jsonwebtoken';
import { meilisearchService } from '#/services/meilisearch.service.ts';

export default () => {
   const router = new Hono();

   /**
    * GET /auth/search-token
    * @summary Get a tenant token for searching, filtering, and sorting (expires in 1 day)
    * @tags Meilisearch
    */
   router.get('/search-token', async (c) =>
      await meilisearchService
         .getTenantToken()
         .then((token) =>
            !token
               ? c.json({ message: 'Failed to generate tenant token' }, 500)
               : c.json({ token }, 200)
         )
         .catch(
            (error) => {
               console.error('Error generating Meilisearch tenant token:', error);
               return c.json({ message: 'Internal server error' }, 500);
            },
         ));

   /**
    * POST /auth/login
    * @summary Request a magic link for authentication
    * @tags Auth
    * @param {Login} request.body.required - User email
    */
   router.post(
      '/login',
      zValidator(
         'json',
         LoginSchema.transform(({ email }) => ({
            email,
            username: email.split('@')[0],
         })),
      ),
      async (c) => {
         const { email, username } = c.req.valid('json');
         const token = await sign({ email, username }, config.JWT_MAGIC_SECRET, {
            expiresIn: config.JWT_MAGIC_EXPIRE,
            noTimestamp: true,
         });

         return (await emailService.sendVerificationEmail(email, token))
            ? c.json({ message: 'Magic link sent to your email' }, 200)
            : c.json({ message: 'Failed to send email' }, 409);
      },
   );

   /**
    * GET /auth/login/{token}
    * @summary Verify magic link token and authenticate user
    * @tags Auth
    * @param {string} token.path.required - Magic link token
    */
   router.get('/login/:token', async (c) => {
      const token = c.req.param('token');

      const decodedToken = await verify(token, config.JWT_MAGIC_SECRET)
         //@ts-ignore: I duuno why
         .catch((error) =>
            c.json(
               { message: 'Invalid or expired token', details: error.message },
               401,
            )
         );

      const { email, username } = decodedToken as {
         email: string;
         username: string;
      };

      return await db
         .select({ id: users.id, username: users.username, email: users.email })
         .from(users)
         .where(eq(users.email, email))
         .then(async (existingUsers) => {
            if (existingUsers.length > 0) {
               return existingUsers[0];
            }

            return await db
               .insert(users)
               .values({ username, email })
               .returning()
               .then(([newUser]) => newUser);
         })
         .then(({ username, email, id: user_id }) =>
            c.json({
               access_token: sign(
                  {
                     user_id,
                     username,
                     email,
                  },
                  config.JWT_CLIENT_SECRET,
                  { expiresIn: config.JWT_CLIENT_EXPIRE },
               ),
               token_type: 'bearer',
            }, 200)
         )
         .catch((error) => {
            console.log(`Error: ${error}`);
            return c.json({ message: 'Failed to Login' }, 409);
         });
   });

   /* Commented out in the original code
  router.post('/me',
    validateUser,
    async (c) => c.json(c.get('jwtPayload'), 200)
  );
  */

   return router;
};
