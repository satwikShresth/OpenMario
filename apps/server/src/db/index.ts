import * as schema from './schema';
import { env } from '../../env';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle({
   schema,
   client: pool
});

export { schema, env };

// Re-export all schema tables and types for convenience
export * from './schema';
