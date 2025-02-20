import { Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'postgresql',
   out: './database/migrations',
   schema: './src/db/schema.ts',
   migrations: {
      schema: 'public',
   },
   dbCredentials: {
      host: Deno.env.get('POSTGRES_SERVER'),
      database: Deno.env.get('POSTGRES_DB'),
      password: Deno.env.get('POSTGRES_PASSWORD'),
      port: Number(Deno.env.get('POSTGRES_PORT')),
      user: Deno.env.get('POSTGRES_USER'),
      ssl: false,
   },
   verbose: true,
   strict: true,
}) satisfies Config;
