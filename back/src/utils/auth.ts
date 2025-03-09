import { betterAuth } from 'better-auth';
import { db } from '#db';
import * as schema from '#/db/schema.ts';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
   emailAndPassword: {
      enabled: true,
   },
   database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
         ...schema,
         user: schema.users,
      },
      usePlural: true,
   }),
});
