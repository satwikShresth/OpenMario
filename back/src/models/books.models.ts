import {
   createInsertSchema,
   createSelectSchema,
   createUpdateSchema,
} from 'drizzle-zod';
import { bio, name } from './authors.models.ts';
import { z } from 'zod';
import { books, VALID_GENRES } from '#/db/schema.ts';
import { eq, like } from 'drizzle-orm';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const currentYear = new Date().getFullYear();

const title = (schema: z.ZodString) =>
   schema
      .trim()
      .regex(/^[a-zA-Z\s\-'\p{L}\p{M}]+$/u, {
         message:
            'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
      })
      .min(1, { message: 'Title cannot be empty' })
      .max(200, { message: 'Title must be less than 200 characters' })
      .openapi({
         description: 'The title of the book',
         example: 'The Great Gatsby',
      });

const pub_year = (schema: z.ZodString) =>
   schema
      .trim()
      .regex(/^\d{4}$/, {
         message: 'Publication year must be a valid 4-digit year',
      })
      .refine((year) => {
         const yearNum = parseInt(year);
         return yearNum >= 0 && yearNum <= currentYear;
      }, {
         message: `Publication year must be between 0 and ${currentYear}`,
      })
      .openapi({
         description: 'The year the book was published',
         example: '2023',
      });

const genre = (schema: z.ZodString) =>
   schema
      .trim()
      .min(1, { message: 'Genre cannot be empty' })
      .refine((val: string) => VALID_GENRES.includes(val), {
         message: `Genre must be one of: ${VALID_GENRES.join(', ')}`,
      })
      .openapi({
         description: 'The genre of the book',
         example: VALID_GENRES[0],
         enum: VALID_GENRES,
      });

export const BookSchema = createSelectSchema(books).openapi({
   title: 'Book',
   description: 'A book record with all its properties',
});

export const BookCreateSchema = createInsertSchema(books, {
   title,
   pub_year,
   genre,
   author_id: (schema) => schema.optional(),
   user_id: (schema) => schema.nonnegative().optional(),
})
   .extend({
      author_name: name(z.string()).openapi({
         description: "The name of the book's author",
         example: 'John Doe',
      }),
      author_bio: bio(z.string()).optional().openapi({
         description: 'Optional biography of the author',
         example: 'An accomplished writer with multiple bestsellers',
      }),
   })
   .strict()
   .openapi({
      title: 'BookCreate',
      description: 'Schema for creating a new book record',
   });

export const BookUpdateSchema = createUpdateSchema(books, {
   title,
   pub_year,
   genre,
   user_id: (schema) => schema.nonnegative().optional(),
})
   .extend({
      author_name: name(z.string()).optional().openapi({
         description: "The updated name of the book's author",
         example: 'Jane Smith',
      }),
      author_bio: bio(z.string()).optional().openapi({
         description: 'Updated biography of the author',
         example: 'Award-winning author of contemporary fiction',
      }),
   })
   .strict()
   .openapi({
      title: 'BookUpdate',
      description: 'Schema for updating an existing book record',
   });

export const BaseBookQuerySchema = z.object({
   title: z.string().optional().openapi({
      description: 'Search by book title (partial match)',
      example: 'Gatsby',
   }),
   genre: z.string().optional().openapi({
      description: 'Filter by genre',
      example: VALID_GENRES[0],
      enum: VALID_GENRES,
   }),
   pub_year: z.string()
      .regex(/^\d{4}$/, {
         message: 'Publication year must be a valid 4-digit year',
      })
      .optional()
      .openapi({
         description: 'Filter by publication year',
         example: '2023',
      }),
}).openapi({
   title: 'BookQuery',
   description: 'Schema for querying books with various filters',
});

export const BookQuerySchema = BaseBookQuerySchema
   .transform((query) => {
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

export type Book = z.infer<typeof BookSchema>;
export type BookCreate = z.infer<typeof BookCreateSchema>;
export type BookUpdate = z.infer<typeof BookUpdateSchema>;
export type BookQuery = z.infer<typeof BookQuerySchema>;
