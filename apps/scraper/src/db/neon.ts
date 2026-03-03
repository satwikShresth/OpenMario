import { connectDb } from '@openmario/db';
import { env } from '@env';

let _db: ReturnType<typeof connectDb> | undefined;

export function getNeonDb() {
   if (!_db) {
      _db = connectDb(env.DATABASE_URL);
   }
   return _db;
}
