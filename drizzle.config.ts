import { defineConfig, Config } from 'drizzle-kit';

export default defineConfig({
    dialect: 'sqlite',
    out: './database/migrations',
    schema: './out/db/schema.js',
    migrations: {
        schema: 'public',
    },
    verbose: true,
    strict: true,
    dbCredentials: {
        url: "database.db",
    },
}) satisfies Config;
