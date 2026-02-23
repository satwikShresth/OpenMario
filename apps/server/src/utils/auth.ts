import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, schema } from '@/db';
import { anonymous, openAPI } from 'better-auth/plugins';

import { env } from '@env';

export const auth = betterAuth({
   basePath: '/api/auth',
   baseURL: env.BETTER_AUTH_BASE_URL,
   secret: env.BETTER_AUTH_SECRET,
   emailAndPassword: {
      enabled: true
   },
   // user: {
   //   changeEmail: {
   //     enabled: true
   //   }
   // },
   database: drizzleAdapter(db, {
      schema,
      provider: 'pg'
   }),
   advanced: {
      database: {
         generateId: false
      }
   },
   plugins: [openAPI(), anonymous()]
});

export type AuthUser = (typeof auth.$Infer.Session)['user'];
export type AuthSession = (typeof auth.$Infer.Session)['session'];
