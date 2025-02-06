import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { users } from '#/db/schema.ts';

extendZodWithOpenApi(z);

export const UserSchema = createSelectSchema(users).openapi({
   title: 'User',
   description: 'A book record with all its properties',
});

export const UserCreateSchema = createInsertSchema(users, {
   username: (schema) =>
      schema
         .trim()
         .min(4, 'Full name cannot be less than 4 characters.')
         .max(255, 'Full name cannot exceed 255 characters.'),
   password: (schema) =>
      schema
         .min(4, 'Password must be at least 8 characters long.')
         .max(40, 'Password cannot be more than 40 characters long.')
         .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
         .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
         .regex(/\d/, 'Password must contain at least one number.'),
})
   .strict()
   .openapi({
      title: 'UserCreate',
      description: 'Schema for creating a new book record',
   });

export const JwtPayload = z.object({
   user_id: z.number().int().nonnegative(),
   jid: z.string().uuid(),
   username: z.string(),
   iat: z.number().int().nonnegative(),
}).openapi({
   title: 'Json Web Token',
   description: 'Schema for JWT token',
});

export type JwtPayload = z.infer<typeof JwtPayload>;
export type User = z.infer<typeof UserSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
