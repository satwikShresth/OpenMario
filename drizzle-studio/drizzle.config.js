import { defineConfig, Config } from 'drizzle-kit';

export default defineConfig({
   dialect: 'postgresql',
   dbCredentials: {
      host:process.env.POSTGRES_SERVER,
      database:process.env.POSTGRES_DB,
      password:process.env.POSTGRES_PASSWORD,
      port:process.env.POSTGRES_PORT,
      user:process.env.POSTGRES_USER,
      ssl: false
   },
}) satisfies Config;
