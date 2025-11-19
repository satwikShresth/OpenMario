import { defineConfig } from 'drizzle-kit';
import { env } from './env';

export default defineConfig({
   dialect: 'postgresql',
   schema: './src/db/auth-schema.ts',
   migrations: {
      schema: 'public'
   },
   out: './drizzle',
   dbCredentials: {
      url: env.DATABASE_URL!
   }
});
