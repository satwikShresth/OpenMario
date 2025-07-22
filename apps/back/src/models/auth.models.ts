import { z } from 'zod';

export const LoginSchema = z.object({ email: z.email() }).meta({ id: 'Login' });

export const JwtPayload = z
   .object({
      user_id: z.uuid(),
      username: z.string().min(3).max(50),
      email: z.email(),
      exp: z.number().int().nonnegative(),
   })
   .meta({
      id: 'JWTPayload',
      title: 'JSON Web Token',
      description: 'Schema for JWT payload containing user authentication information',
      example: {
         user_id: '123e4567-e89b-12d3-a456-426614174000',
         username: 'john_doe',
         iat: 1620000000,
      },
   });

export type JwtPayload = z.infer<typeof JwtPayload>;
export type Login = z.infer<typeof LoginSchema>;
