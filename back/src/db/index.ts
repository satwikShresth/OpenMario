import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const client = neon(
   Deno.env.get('DATABASE_URL')!,
);

export const db = drizzle({ client });

export * from './openmario/schema.ts';
export * from './scheduler/schema.ts';
