import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const JwtPayload = z.object({
   user_id: z.string().uuid()
      .openapi({
         description: 'Unique identifier for the user',
         example: '123e4567-e89b-12d3-a456-426614174000',
      }),
   username: z.string()
      .min(3)
      .max(50)
      .openapi({
         description: 'Username of the authenticated user',
         example: 'john_doe',
         minLength: 3,
         maxLength: 50,
      }),
   iat: z.number()
      .int()
      .nonnegative()
      .openapi({
         description: 'Issued at timestamp (in seconds since Unix epoch)',
         example: 1620000000,
         minimum: 0,
      }),
})
   .openapi({
      title: 'JSON Web Token',
      description: 'Schema for JWT payload containing user authentication information',
      example: {
         user_id: '123e4567-e89b-12d3-a456-426614174000',
         username: 'john_doe',
         iat: 1620000000,
      },
   });

export type JwtPayload = z.infer<typeof JwtPayload>;
