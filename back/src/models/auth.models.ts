import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

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
