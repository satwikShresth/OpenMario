import { Response, Router } from 'express';
import { db } from '#db';
import { authors } from '#/db/schema.ts';
import { and, eq } from 'drizzle-orm';
import {
   AuthorCreate,
   AuthorCreateSchema,
   AuthorQuery,
   AuthorQuerySchema,
   AuthorUpdateSchema,
   paramsIdSchema,
   RequestParamsId,
} from '#models';

import {
   validateOwner,
   validateUser,
   zodBodyValidator,
   zodParamsValidator,
   zodQueryValidator,
} from '#/middleware/validation.middleware.ts';

export default () => {
   const router = Router();

   router.route('/')
      .get(
         zodQueryValidator(AuthorQuerySchema),
         async (req: RequestParamsId, res: Response) => {
            const queries = req?.validated?.query as AuthorQuery;

            return await db
               .select()
               .from(authors)
               .where(queries.length > 0 ? and(...queries) : undefined)
               .all()
               .then((result) => res.status(200).json(result))
               .catch(({ message }) => res.status(409).json({ message }));
         },
      )
      .post(
         validateUser,
         zodBodyValidator(AuthorCreateSchema),
         async (req: RequestParamsId, res: Response) => {
            const insertValues = req?.validated?.body as AuthorCreate;

            return await db
               .insert(authors)
               .values({ ...insertValues, user_id: req?.auth?.user_id! })
               .returning()
               .then((result) => res.status(201).json(result))
               .catch(({ message }) => res.status(409).json({ message }));
         },
      );

   router.route('/:id')
      .all(
         validateUser,
         zodParamsValidator(paramsIdSchema),
         validateOwner(authors),
      )
      .get(async (req: RequestParamsId, res: Response) => {
         const validatedId = req?.validated?.params?.id!;

         return await db
            .select()
            .from(authors)
            .where(eq(authors.id, validatedId!))
            .then((result) =>
               !result
                  ? res.status(404).json({ detail: 'Author not found' })
                  : res.status(200).json(result)
            )
            .catch(({ message }) => res.status(409).json({ message }));
      })
      .put(
         zodBodyValidator(AuthorUpdateSchema),
         async (req: RequestParamsId, res: Response) => {
            console.log('reaching');
            const validatedId = req?.validated?.params?.id!;
            const updateData = req?.validated?.body!;

            return await db
               .update(authors)
               .set(updateData)
               .where(eq(authors.id, validatedId))
               .returning()
               .then((result) => res.status(200).json(result))
               .catch(({ message }) => res.status(409).json({ message }));
         },
      )
      .delete(async (req: RequestParamsId, res: Response) => {
         const validatedId = req?.validated?.params?.id!;
         return await db
            .delete(authors)
            .where(eq(authors.id, validatedId!))
            .returning({ deleted_id: authors.id })
            .then((result) => res.status(200).json(result))
            .catch(({ message }) => res.status(409).json({ message }));
      });

   return router;
};
