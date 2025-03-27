import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './scheduler/schema.ts';
import pg from 'pg';

const client = new pg.Pool({
   user: Deno.env.get('POSTGRES_PASSWORD'),
   password: Deno.env.get('POSTGRES_USER'),
   database: Deno.env.get('POSTGRES_DB'),
   host: Deno.env.get('POSTGRES_SERVER'),
   port: Deno.env.get('POSTGRES_PORT'),
   min: 2,
   max: 10,
});

export const db = drizzle({ client, schema });

export * from './openmario/schema.ts';
export * from './scheduler/schema.ts';
