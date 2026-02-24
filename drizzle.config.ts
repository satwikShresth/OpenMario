import { defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'postgresql',
   schema: './packages/db/src/schema/index.ts',
   migrations: {
      schema: 'public'
   },
   out: './packages/db/drizzle/migrations',
   dbCredentials: {
      url: process.env.DATABASE_URL!
   }
});
