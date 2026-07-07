import { connectDb } from '@openmario/db';

if (!process.env.DATABASE_URL) {
   throw new Error('DATABASE_URL is required');
}

export const db = connectDb(process.env.DATABASE_URL);
