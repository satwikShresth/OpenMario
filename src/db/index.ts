import * as url from "url";
import { drizzle } from 'drizzle-orm/libsql';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';


const __dirname = url.fileURLToPath(new URL("../..", import.meta.url));
const dbfile: string = `file:${__dirname}database.db`;

const client = createClient({ url: dbfile });

export type database = LibSQLDatabase<typeof schema>
export const db: database = drizzle(client, { schema });
