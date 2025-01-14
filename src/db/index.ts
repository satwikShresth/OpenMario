import * as url from 'node:url';
import { drizzle } from 'drizzle-orm/libsql';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/sqlite3';

const __dirname = url.fileURLToPath(new URL('../..', import.meta.url));
const dbfile: string = `file:${__dirname}database.db`;

const client = createClient({ url: dbfile });

export type database = LibSQLDatabase<Record<string, never>>;
export const db = drizzle(client);
