import {
   createInsertSchema,
   createSelectSchema,
   createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';
import { authors, books, VALID_GENRES } from '#db/schema.ts';

const currentYear = new Date().getFullYear();

const name = (schema: z.ZodString) =>
   schema.trim()
      .min(1, { message: 'Name cannot be empty' })
      .max(100, { message: 'Name must be less than 100 characters' })
      .regex(/^[a-zA-Z\s\-'\p{L}\p{M}]+$/u, {
         message:
            'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
      });

const bio = (schema: z.ZodString) =>
   schema
      .trim()
      .max(1000, { message: 'Bio must be less than 1000 characters' })
      .nullable()
      .transform((val) => val === '' ? null : val);

const title = (schema: z.ZodString) =>
   schema
      .trim()
      .min(1, { message: 'Title cannot be empty' })
      .max(200, { message: 'Title must be less than 200 characters' });

const pub_year = (schema: z.ZodString) =>
   schema
      .trim()
      .regex(/^\d{4}$/, {
         message: 'Publication year must be a valid 4-digit year',
      })
      .refine((year) => {
         const yearNum = parseInt(year);
         return yearNum >= 1000 && yearNum <= currentYear;
      }, {
         message: `Publication year must be between 1000 and ${currentYear}`,
      });

const genre = (schema: z.ZodString) =>
   schema
      .trim()
      .min(1, { message: 'Genre cannot be empty' })
      .refine((val: string) => VALID_GENRES.includes(val), {
         message: `Genre must be one of: ${VALID_GENRES.join(', ')}`,
      });

export const AuthorSchema = createSelectSchema(authors);
export const BookSchema = createSelectSchema(books);

export const AuthorCreateSchema = createInsertSchema(authors, {
   name,
   bio,
}).strict();

export const AuthorUpdateSchema = createUpdateSchema(authors, {
   name,
   bio,
}).strict();

export const BookCreateSchema = createInsertSchema(books, {
   title,
   pub_year,
   genre,
}).strict();

export const BookUpdateSchema = createUpdateSchema(books, {
   title,
   pub_year,
   genre,
}).strict();

export const AuthorResponseSchema = AuthorSchema.extend({
   books: z.array(BookSchema).optional(),
});

export const BookResponseSchema = BookSchema.extend({
   author: AuthorSchema.optional(),
});

// Types
export type Author = z.infer<typeof AuthorSchema>;
export type AuthorCreate = z.infer<typeof AuthorCreateSchema>;
export type AuthorUpdate = z.infer<typeof AuthorUpdateSchema>;
export type Book = z.infer<typeof BookSchema>;
export type BookCreate = z.infer<typeof BookCreateSchema>;
export type BookUpdate = z.infer<typeof BookUpdateSchema>;
export type AuthorResponse = z.infer<typeof AuthorResponseSchema>;
export type BookResponse = z.infer<typeof BookResponseSchema>;

