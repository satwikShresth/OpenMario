import { Config, defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./database/scheduler/migrations",
  schema: "./src/db/scheduler/schema.ts",
  dbCredentials: {
    user: Deno.env.get("SCHEDULER_USER"),
    password: Deno.env.get("SCHEDULER_PASSWORD"),
    database: Deno.env.get("SCHEDULER_DB"),
    host: Deno.env.get("SCHEDULER_SERVER"),
    port: Number(Deno.env.get("SCHEDULER_PORT")),
    ssl: false,
  },
  verbose: true,
  strict: true,
}) satisfies Config;
