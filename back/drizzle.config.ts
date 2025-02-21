import { Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'postgresql',
   out: './database/migrations',
   schema: './src/db/schema.ts',
   migrations: {
      schema: 'public',
   },
   dbCredentials: {
      user: 'postgres',
      password: 'postgres',
      database: 'openmario',
      host: 'localhost',
      port: 5432,
      ssl: false,
   },
   verbose: true,
   strict: true,
}) satisfies Config;
