import { Request, Response, Router } from 'express';
import { db } from '#/db/index.ts';
import { authors } from '#/db/schema.ts';
import {
   AuthorCreate,
   AuthorCreateSchema,
   AuthorUpdateSchema,
} from '#/db/types.ts';
import { and, eq } from 'drizzle-orm';
import {
   AuthorQuery,
   AuthorQuerySchema,
   paramsIdSchema,
   RequestParamsId,
} from '#/models/authors.books.models.ts';
import {
   zodBodyValidator,
   zodParamsValidator,
   zodQueryValidator,
} from '#/middleware/validation.middleware.ts';

export default () => {
   const router = Router();

   router.route('/')
      .get(
         zodQueryValidator(AuthorQuerySchema),
         async (req: Request, res: Response) => {
            const queries = req.query as AuthorQuery;

            const queryResult = await db
               .select()
               .from(authors)
               .where(queries.length > 0 ? and(...queries) : undefined)
               .all();

            res.status(200).json(queryResult);
         },
      )
      .post(
         zodBodyValidator(AuthorCreateSchema),
         async (req: Request, res: Response) => {
            const insertValues = req.body as AuthorCreate;

            const newAuthor = await db
               .insert(authors)
               .values(insertValues)
               .returning();

            res.status(201).json(newAuthor);
         },
      );

   router.route('/:id')
      .all(zodParamsValidator(paramsIdSchema))
      .get(async (req: RequestParamsId, res: Response) => {
         const validatedId = req?.params?.id!;

         const result = await db
            .select()
            .from(authors)
            .where(eq(authors.id, validatedId!));

         if (!result) {
            return res.status(404).json({ detail: 'Author not found' });
         }

         res.json(result);
      })
      .put(
         zodBodyValidator(AuthorUpdateSchema),
         async (req: RequestParamsId, res: Response) => {
            const validatedId = req?.params?.id!;
            const updateData = req?.body!;

            const updatedAuthor = await db
               .update(authors)
               .set(updateData)
               .where(eq(authors.id, validatedId))
               .returning();

            res.json(updatedAuthor);
         },
      )
      .delete(async (req: RequestParamsId, res: Response) => {
         const result = await db
            .delete(authors)
            .where(eq(authors.id, req.validatedId!))
            .returning({ deleted_id: authors.id });

         res.json(result);
      });

   return router;
};
