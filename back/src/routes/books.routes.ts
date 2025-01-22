//routes/books.routes.ts
import { Request, Response, Router } from 'express';
import { db } from '#db';
import { authors, books } from '#/db/schema.ts';
import {
   BookCreate,
   BookCreateSchema,
   BookQuery,
   BookQuerySchema,
   BookUpdate,
   BookUpdateSchema,
   paramsIdSchema,
   RequestParamsId,
} from '#models';
import {
   zodBodyValidator,
   zodParamsValidator,
   zodQueryValidator,
} from '#/middleware/validation.middleware.ts';
import { and, eq } from 'drizzle-orm';

const checkCreateAuthor = async (
   author_name: string,
   author_bio: string | null | undefined,
) => {
   if (author_name) {
      const existingAuthor = await db
         .select({ id: authors.id })
         .from(authors)
         .where(eq(authors.name, author_name))
         .get();

      if (!existingAuthor) {
         const newAuthor = await db
            .insert(authors)
            .values({
               name: author_name,
               bio: author_bio === undefined ? null : author_bio,
            })
            .returning({ id: authors.id })
            .get();

         return newAuthor.id;
      }

      return existingAuthor.id;
   }
};

export default () => {
   const router = Router();

   router.route('/')
      .get(
         zodQueryValidator(BookQuerySchema),
         async (req: Request, res: Response) => {
            const queries = req?.validated?.query as BookQuery;

            return await db
               .select()
               .from(books)
               .where(queries.length > 0 ? and(...queries) : undefined)
               .all()
               .then((result) => res.status(200).json(result))
               .catch(({ message }) => res.status(409).json({ message }));
         },
      )
      .post(
         zodBodyValidator(BookCreateSchema),
         async (req: Request, res: Response) => {
            const insertData = req?.validated?.body as BookCreate;
            const author_id = (await checkCreateAuthor(
               insertData.author_name,
               insertData.author_bio,
            ))!;

            return await db
               .insert(books)
               .values({
                  title: insertData.title!,
                  pub_year: insertData.pub_year!,
                  genre: insertData.genre!,
                  author_id,
               })
               .returning()
               .then((result) => res.status(201).json(result))
               .catch(({ message }) => res.status(409).json({ message }));
         },
      );

   router.route('/:id')
      .all(zodParamsValidator(paramsIdSchema))
      .get(async (req: RequestParamsId, res: Response) => {
         const validatedId = req?.validated?.params?.id!;

         return await db
            .select()
            .from(books)
            .where(eq(books.id, validatedId!))
            .then((result) =>
               !result
                  ? res.status(404).json({ detail: 'Book not found' })
                  : res.status(200).json(result)
            )
            .catch(({ message }) => res.status(409).json({ message }));
      })
      .put(
         zodBodyValidator(BookUpdateSchema),
         async (req: RequestParamsId, res: Response) => {
            const validatedId = req?.validated?.params?.id!;
            const updateData = req?.validated?.body! as BookUpdate;

            const author_id = await checkCreateAuthor(
               updateData.author_name!,
               updateData.author_bio!,
            );

            return await db
               .update(books)
               .set({
                  ...Object.fromEntries(
                     Object.entries({
                        title: updateData.title!,
                        pub_year: updateData.pub_year!,
                        genre: updateData.genre!,
                        author_id,
                     }).filter(([_, value]) => value !== undefined),
                  ),
               })
               .where(eq(books.id, validatedId))
               .returning()
               .then((result) => res.status(200).json(result))
               .catch(({ message }) => res.status(409).json({ message }));
         },
      )
      .delete(async (req: RequestParamsId, res: Response) => {
         const validatedId = req?.validated?.params?.id!;

         return await db
            .delete(books)
            .where(eq(books.id, validatedId!))
            .returning({ deleted_id: books.id })
            .then((result) => res.status(200).json(result))
            .catch(({ message }) => res.status(409).json({ message }));
      });
   return router;
};
