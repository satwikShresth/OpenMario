import { connectDb } from '@openmario/db';
import { env } from '@env';

export const db = connectDb(env.DATABASE_URL);
