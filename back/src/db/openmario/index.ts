import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
export * from './schema.ts';

const client = new pg.Pool({
   user: Deno.env.get('POSTGRES_PASSWORD'),
   password: Deno.env.get('POSTGRES_USER'),
   database: Deno.env.get('POSTGRES_DB'),
   host: Deno.env.get('POSTGRES_SERVER'),
   port: Deno.env.get('POSTGRES_PORT'),
   min: 2,
   max: 10,
});

export const db = drizzle({ client });
