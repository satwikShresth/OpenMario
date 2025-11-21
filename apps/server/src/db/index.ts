import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from '../../env';

export const db = drizzle({
   connection: {
      connectionString: env.DATABASE_URL
   }
   // schema
});

export { schema, env };

// Re-export all schema tables and types for convenience
export * from './schema';
