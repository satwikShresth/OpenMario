import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { authors, books } from './schema.js';

//validators
export const AuthorSchema = createSelectSchema(authors)
export const AuthorCreateSchema = createInsertSchema(authors, {
    name: (schema) => schema.min(1, { message: "Name cannot be empty" }).max(100),
    bio: (schema) => schema.max(1000),
});
export const AuthorUpdateSchema = createUpdateSchema(authors);

export const BookSchema = createSelectSchema(books)
export const BookCreateSchema = createInsertSchema(books);
export const BookUpdateSchema = createUpdateSchema(books);



//types
export type Author = z.infer<typeof AuthorSchema>;
export type AuthorCreate = z.infer<typeof AuthorCreateSchema>;
export type AuthorUpdate = z.infer<typeof AuthorUpdateSchema>;

export type Book = z.infer<typeof BookSchema>;
export type BookCreate = z.infer<typeof BookCreateSchema>;
export type BookUpdate = z.infer<typeof BookUpdateSchema>;
