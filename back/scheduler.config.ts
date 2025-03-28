import { Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
   dialect: 'postgresql',
   out: './database/scheduler/migrations',
   schema: './src/db/scheduler/schema.ts',
   dbCredentials: {
      user: Deno.env.get('LOCAL_SCHEDULER_USER'),
      password: Deno.env.get('LOCAL_SCHEDULER_PASSWORD'),
      database: Deno.env.get('LOCAL_SCHEDULER_DB'),
      host: Deno.env.get('LOCAL_SCHEDULER_SERVER'),
      port: Number(Deno.env.get('LOCAL_SCHEDULER_PORT')),
      ssl: false,
   },
   verbose: true,
   strict: true,
}) satisfies Config;
