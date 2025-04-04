import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost",
    database: "openmario",
    password: "postgres",
    port: 5432,
    user: "postgres",
    ssl: false,
  },
});
