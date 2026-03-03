import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

let _instance: DbClient | undefined;

export function connectDb(connectionString: string): DbClient {
   if (!_instance) {
      _instance = drizzle(connectionString, { schema });
   }
   return _instance;
}

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

export { schema };
export * from './schema';
