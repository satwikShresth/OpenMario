import { Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'postgresql',
   out: './database/openmario/migrations',
   schema: './src/db/openmario/schema.ts',
   migrations: {
      schema: 'public',
   },
   dbCredentials: {
      user: Deno.env.get('POSTGRES_PASSWORD'),
      password: Deno.env.get('POSTGRES_USER'),
      database: Deno.env.get('POSTGRES_DB'),
      host: Deno.env.get('POSTGRES_SERVER'),
      port: Deno.env.get('POSTGRES_PORT'),
      ssl: false,
   },
   verbose: true,
   strict: true,
}) satisfies Config;
