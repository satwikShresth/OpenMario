import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { authors, books } from './schema.js';

const name = (schema: z.ZodString) => schema
    .min(1, { message: "Cannot be Empty" })
    .max(100, { message: "Name must be less than 100 characters" });

const bio = (schema: z.ZodString) => schema
    .max(1000, { message: "Bio must be less than 1000 characters" });

const title = (schema: z.ZodString) => schema
    .min(1, { message: "Title cannot be empty" })
    .max(200, { message: "Title must be less than 200 characters" });

const pub_year = (schema: z.ZodString) => schema
    .regex(/^\d{4}$/, { message: "Publication year must be a valid 4-digit year" });

const genre = (schema: z.ZodString) => schema
    .min(1, { message: "Genre cannot be empty" })
    .max(50, { message: "Genre must be less than 50 characters" });

export const AuthorSchema = createSelectSchema(authors)
export const AuthorCreateSchema = createInsertSchema(authors, { name, bio });
export const AuthorUpdateSchema = createUpdateSchema(authors, { name, bio });

export const BookSchema = createSelectSchema(books)
export const BookCreateSchema = createInsertSchema(books, { title, pub_year, genre });
export const BookUpdateSchema = createUpdateSchema(books, { title, pub_year, genre });



//types
export type Author = z.infer<typeof AuthorSchema>;
export type AuthorCreate = z.infer<typeof AuthorCreateSchema>;
export type AuthorUpdate = z.infer<typeof AuthorUpdateSchema>;

export type Book = z.infer<typeof BookSchema>;
export type BookCreate = z.infer<typeof BookCreateSchema>;
export type BookUpdate = z.infer<typeof BookUpdateSchema>;
