import {
   createInsertSchema,
   createSelectSchema,
   createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';
import { authors } from '#/db/schema.ts';
import { like } from 'drizzle-orm/expressions';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Schema } from 'zod';

extendZodWithOpenApi(z);

export const name = (schema: z.ZodString) =>
   schema
      .trim()
      .min(1, { message: 'Name cannot be empty' })
      .max(100, { message: 'Name must be less than 100 characters' })
      .regex(/^[a-zA-Z\s\-'\p{L}\p{M}]+$/u, {
         message:
            'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
      })
      .openapi({
         description: "Author's full name",
         example: 'Jane Austen',
      });

export const bio = (schema: z.ZodString) =>
   schema
      .trim()
      .regex(/^[a-zA-Z\s\-'\p{L}\p{M}]+$/u, {
         message:
            'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
      })
      .max(1000, { message: 'Bio must be less than 1000 characters' })
      .nullable()
      .transform((val) => val === '' ? null : val)
      .openapi({
         description: "Author's biographical information",
         example: 'A renowned author known for her works in classic literature',
      });

export const AuthorSchema = createSelectSchema(authors)
   .openapi({
      title: 'Author',
      description: 'Complete author record with all properties',
   });

export const AuthorCreateSchema = createInsertSchema(authors, {
   name,
   bio,
   user_id: (schema) => schema.nonnegative().optional(),
})
   .strict()
   .openapi({
      title: 'AuthorCreate',
      description: 'Schema for creating a new author record',
   });

export const AuthorUpdateSchema = createUpdateSchema(authors, {
   name,
   bio,
   user_id: (schema) => schema.nonnegative().optional(),
})
   .strict()
   .openapi({
      title: 'AuthorUpdate',
      description: 'Schema for updating an existing author record',
   });

export const BaseAuthorQuerySchema = z.object({
   name: z.string()
      .optional()
      .openapi({
         description: 'Search by author name (partial match)',
         example: 'Jane',
      }),
   bio: z.string()
      .optional()
      .openapi({
         description: 'Search within author biography (partial match)',
         example: 'award-winning',
      }),
}).openapi({
   title: 'AuthorQuery',
   description: 'Schema for querying authors with various filters',
});

export const AuthorQuerySchema = BaseAuthorQuerySchema
   .transform((query) => {
      const queries = [];
      if (query?.name) {
         queries.push(like(authors.name, `%${query.name.trim()}%`));
      }
      if (query?.bio) {
         queries.push(like(authors.bio, `%${query.bio.trim()}%`));
      }
      return queries;
   });

// Types
export type Author = z.infer<typeof AuthorSchema>;
export type AuthorCreate = z.infer<typeof AuthorCreateSchema>;
export type AuthorUpdate = z.infer<typeof AuthorUpdateSchema>;
export type AuthorQuery = z.infer<typeof AuthorQuerySchema>;
