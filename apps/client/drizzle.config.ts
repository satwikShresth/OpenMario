import { defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'postgresql',
   schema: './src/db/schema/index.ts',
   out: './src/db/drizzle',
   driver: 'pglite',
   dbCredentials: { url: 'idb://openmario-data' }
});
