import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, schema } from '@/db';
import { anonymous, openAPI, emailOTP } from 'better-auth/plugins';

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
   plugins: [
      openAPI(),
      anonymous(),
      emailOTP({
         async sendVerificationOTP({ email, otp, type }) {
            console.log(email, otp);
            if (type === 'sign-in') {
               // Send the OTP for sign in
            } else if (type === 'email-verification') {
               // Send the OTP for email verification
            } else {
               // Send the OTP for password reset
            }
         }
      })
   ]
});

export type AuthUser = (typeof auth.$Infer.Session)['user'];
export type AuthSession = (typeof auth.$Infer.Session)['session'];
