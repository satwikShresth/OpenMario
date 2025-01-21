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

            const queryResult = await db
               .select()
               .from(books)
               .where(queries.length > 0 ? and(...queries) : undefined)
               .all();

            res.status(200).json(queryResult);
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

            const newBook = await db
               .insert(books)
               .values({
                  title: insertData.title!,
                  pub_year: insertData.pub_year!,
                  genre: insertData.genre!,
                  author_id,
               })
               .returning()
               .catch((_error) => res.status(409).json({}));

            res.status(201).json(newBook);
         },
      );

   router.route('/:id')
      .all(zodParamsValidator(paramsIdSchema))
      .get(async (req: RequestParamsId, res: Response) => {
         const validatedId = req?.validated?.params?.id!;

         const result = await db
            .select()
            .from(books)
            .where(eq(books.id, validatedId!));

         if (!result) {
            return res.status(404).json({ detail: 'Author not found' });
         }

         res.json(result);
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

            const updatedAuthor = await db
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
               .returning();

            res.json(updatedAuthor);
         },
      )
      .delete(async (req: RequestParamsId, res: Response) => {
         const validatedId = req?.validated?.params?.id!;

         const result = await db
            .delete(books)
            .where(eq(books.id, validatedId!))
            .returning({ deleted_id: books.id });

         res.json(result);
      });
   return router;
};
