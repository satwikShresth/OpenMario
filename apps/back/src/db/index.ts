import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle({
  connection: {
    connectionString: Deno.env.get("DATABASE_URL")!,
    ssl: true,
  },
});

export * from "./openmario/schema.ts";
export * from "./scheduler/schema.ts";
