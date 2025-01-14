import { NextFunction, Request, Response, Router } from 'express';
import { db } from '#db/index.ts';
import { authors } from '#db/schema.ts';
import { z } from 'zod';
import {
   AuthorCreate,
   AuthorCreateSchema,
   AuthorUpdate,
   AuthorUpdateSchema,
} from '#db/types.ts';
import { formatZodError } from '#utils/formatter.ts';
import { and, eq, like } from 'drizzle-orm';

interface RequestParamsId extends Request {
   params: {
      id: string;
   };
   body?: AuthorUpdate;
   validatedId?: number;
}

const paramsIdSchema = z.object({
   id: z.preprocess(
      (val) => Number(val),
      z.number().positive(),
   ),
});

const validateId = async (
   req: RequestParamsId,
   res: Response,
   next: NextFunction,
) => {
   const result = await paramsIdSchema.safeParseAsync({ id: req.params.id });
   if (!result.success) {
      return res.status(400).send({
         type: 'Params',
         errors: formatZodError(result.error).error,
      });
   }
   req.validatedId = result?.data?.id;
   next();
};

// Query validation schema
export const AuthorQuerySchema = z.object({
   name: z.string().optional(),
   bio: z.string().optional(),
}).transform((query) => {
   const queries = [];

   if (query?.name) {
      queries.push(like(authors.name, `%${query.name.trim()}%`));
   }

   if (query?.bio) {
      queries.push(like(authors.bio, `%${query.bio.trim()}%`));
   }

   return queries;
});

export type AuthorQuery = z.infer<typeof AuthorQuerySchema>;

export default () => {
   const router = Router();

   router.route('/')
      .get(async (req: Request, res: Response) => {
         const result = await AuthorQuerySchema.safeParseAsync(req.query);

         if (!result.success) {
            return res.status(400).send({
               type: 'Query',
               errors: formatZodError(result.error).error,
            });
         }
         const queries = result.data;

         console.log(queries);

         const queryResult = await db
            .select()
            .from(authors)
            .where(queries.length > 0 ? and(...queries) : undefined)
            .all();

         console.log(queryResult);
         res.status(200).json(queryResult);
      })
      .post(async (req: Request, res: Response) => {
         const result = await AuthorCreateSchema.safeParseAsync(req.body);

         if (!result.success) {
            console.log(formatZodError(result.error).error);
            return res.status(400).send({
               type: 'Body',
               errors: formatZodError(result.error).error,
            });
         }

         const newAuthor = await db
            .insert(authors)
            .values(result.data as AuthorCreate)
            .returning();

         res.status(201).json(newAuthor);
      });

   router.route('/:id')
      .all(validateId)
      .get(async (req: RequestParamsId, res: Response) => {
         const result = await db
            .select()
            .from(authors)
            .where(eq(authors.id, req.validatedId!));

         if (!result) {
            return res.status(404).json({ detail: 'Author not found' });
         }

         res.json(result);
      })
      .put(async (req: RequestParamsId, res: Response) => {
         const result = await AuthorUpdateSchema.safeParseAsync(req.body);

         if (!result.success) {
            console.log(formatZodError(result.error).error);
            return res.status(400).send({
               type: 'Body',
               errors: formatZodError(result.error).error,
            });
         }

         const updatedAuthor = await db
            .update(authors)
            .set(result.data)
            .where(eq(authors.id, req.validatedId!))
            .returning();

         res.json(updatedAuthor);
      })
      .delete(async (req: RequestParamsId, res: Response) => {
         const result = await db
            .delete(authors)
            .where(eq(authors.id, req.validatedId!))
            .returning({ deleted_id: authors.id });

         res.json(result);
      });

   return router;
};
