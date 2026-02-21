import { defineConfig } from 'drizzle-kit';
import { env } from './env';

export default defineConfig({
   dialect: 'postgresql',
   schema: './src/db/schema/index.ts',
   migrations: {
      schema: 'public'
   },
   out: './drizzle/migrations',
   dbCredentials: {
      url: env.DATABASE_URL!
   }
});
