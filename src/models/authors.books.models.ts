import { z } from 'zod';
import { Request } from 'express';
import { eq, like } from 'drizzle-orm';
import { authors, books, VALID_GENRES } from '#/db/schema.ts';

export interface RequestParamsId extends Request {
   params: {
      id: number;
   };
   validated?: {
      body?: any;
      params?: any;
      query?: any;
   };
}

export const paramsIdSchema = z.object({
   id: z.preprocess(
      (val) => Number(val),
      z.number().positive(),
   ),
});

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

export const BookQuerySchema = z.object({
   title: z.string().optional(),
   genre: z.string().optional(),
   pub_year: z.string()
      .regex(/^\d{4}$/, {
         message: 'Publication year must be a valid 4-digit year',
      })
      .optional(),
}).transform((query) => {
   const queries = [];

   if (query?.title) {
      queries.push(like(books.title, `%${query.title.trim()}%`));
   }

   if (query?.genre && VALID_GENRES.includes(query?.genre)) {
      queries.push(eq(books.genre, query.genre.trim()));
   }

   if (query?.pub_year) {
      queries.push(eq(books.pub_year, query.pub_year.trim()));
   }

   return queries;
});

export type AuthorQuery = z.infer<typeof AuthorQuerySchema>;
export type BookQuery = z.infer<typeof BookQuerySchema>;
