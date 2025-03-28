import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const client = new pg.Pool({
   user: Deno.env.get('LOCAL_SCHEDULER_USER'),
   password: Deno.env.get('LOCAL_SCHEDULER_PASSWORD'),
   database: Deno.env.get('LOCAL_SCHEDULER_DB'),
   host: Deno.env.get('LOCAL_SCHEDULER_SERVER'),
   port: Number(Deno.env.get('LOCAL_SCHEDULER_PORT')),
   min: 2,
   max: 10,
});

export const db = drizzle({ client });
