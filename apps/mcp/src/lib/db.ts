import { connectDb, type DbClient } from '@openmario/db';
import { env } from '@env';

let db: DbClient | undefined;

export function getDb(): DbClient {
   if (!db) db = connectDb(env.DATABASE_URL);
   return db;
}
