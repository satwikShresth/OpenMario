import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
export * from "./schema.ts";

const client = new pg.Pool({
  user: "postgres",
  password: "postgres",
  database: "openmario",
  host: "localhost",
  port: 5432,
  min: 2,
  max: 10,
});

export const db = drizzle({ client });
