import { Response, Router } from 'express';
import { Request } from 'express-jwt';
import { zodBodyValidator } from '#/middleware/validation.middleware.ts';
import { db } from '#db';
import { RequestParamsId, UserCreate, UserCreateSchema } from '#models';
import { revoked, users } from '#/db/schema.ts';
import { eq } from 'drizzle-orm';
import { hash, verify } from 'argon2';
import { sign } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

export default () => {
   const router = Router();

   router.post(
      '/logout',
      async (req: Request, res: Response): Promise<Response> => {
         console.log(req.auth);
         return await db
            .insert(revoked)
            .values([{ signature: req.auth?.jid! }])
            .returning()
            .then((_result) =>
               res
                  .status(200)
                  .json({ message: 'Jwt token revoked' })
            )
            .catch(({ message }) => res.status(409).json({ message }));
      },
   );

   router.post(
      '/signup',
      zodBodyValidator(UserCreateSchema),
      async (req: RequestParamsId, res: Response): Promise<Response> => {
         const insertValue = req?.validated?.body as UserCreate;

         return await db
            .insert(users)
            .values({
               username: insertValue.username,
               password: await hash(insertValue.password),
            })
            .returning()
            .then((result) => res.status(201).json(result))
            .catch(({ message }) => res.status(409).json({ message }));
      },
   );

   router.post(
      '/access-token',
      zodBodyValidator(UserCreateSchema),
      async (
         req: RequestParamsId,
         res: Response,
      ): Promise<Response> => {
         const { username, password } = req?.validated?.body as UserCreate;

         return await db
            .select({ id: users.id, password: users.password })
            .from(users)
            .where(eq(users.username, username))
            .then((users) => users[0])
            .then(async (user) => {
               console.log(password);
               console.log(user.password);
               return await verify(user.password, password)
                  ? res
                     .status(200)
                     .json({
                        access_token: sign(
                           {
                              user_id: user.id,
                              jid: randomUUID(),
                              username,
                              iat: Math.floor(Date.now() / 1000),
                           },
                           'Your-Secreat-Here',
                           { expiresIn: '24h' },
                        ),
                        token_type: 'bearer',
                     })
                  : res
                     .status(401)
                     .json({
                        message: 'Invalid Username or Password',
                     });
            })
            .catch(({ message }) => {
               console.log(message);
               return res.status(409).json({ message });
            });
      },
   );

   router.post(
      '/me',
      (req: Request, res: Response): Promise<Response> =>
         res
            .status(200)
            .json(req?.auth),
   );

   return router;
};
