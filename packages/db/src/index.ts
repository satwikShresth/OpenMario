import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

let _instance: DbClient | undefined;

export function connectDb(connectionString: string): DbClient {
   if (!_instance) {
      const pool = new Pool({ connectionString });
      _instance = drizzle({ schema, client: pool });
   }
   return _instance;
}

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

export { schema };
export * from './schema';
