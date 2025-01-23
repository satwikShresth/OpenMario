import { defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'sqlite',
   out: './database/migrations',
   schema: './src/db/schema.ts',
   migrations: {
      schema: 'public',
   },
   verbose: true,
   strict: true,
});
