import { defineConfig, Config } from 'drizzle-kit';

export default defineConfig({
   dialect: 'postgresql',
   dbCredentials: {
      user:'postgres',
      password:'postgres',
      database:'openmario',
      host:"localhost",
      port:5432,
      ssl: false
   },
}) satisfies Config;
