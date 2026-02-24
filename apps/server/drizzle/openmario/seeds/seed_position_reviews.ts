import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { db, position_review, position } from '../../../src/db/index.ts';

const BATCH_SIZE = 20;

const INPUT_PATH = join(
   process.env.HOME!,
   'Projects',
   'drexel-scraper',
   'src',
   'position_reviews.json'
);

// Strip null bytes and other characters Postgres can't accept in UTF-8
function sanitize(val: any): any {
   if (typeof val === 'string') return val.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
   return val;
}

function sanitizeRow(row: any): any {
   const out: any = {};
   for (const [k, v] of Object.entries(row)) out[k] = sanitize(v);
   return out;
}

const reviews: any[] = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'));
console.log(`Loaded ${reviews.length} reviews from JSON`);

// Filter to only rows whose position_id exists in the DB
console.log('Fetching existing position IDs from DB...');
const existingPositions = await db.select({ id: position.id }).from(position);
const validPositionIds = new Set(existingPositions.map(r => r.id));
console.log(`  Found ${validPositionIds.size} positions in DB`);

const insertable = reviews.filter(r => validPositionIds.has(r.position_id));
const skipped = reviews.length - insertable.length;
console.log(`  Insertable: ${insertable.length}, Skipped (missing FK): ${skipped}`);

// Batch insert
let inserted = 0;
for (let i = 0; i < insertable.length; i += BATCH_SIZE) {
   const batch = insertable.slice(i, i + BATCH_SIZE).map(sanitizeRow);
   await db.insert(position_review).values(batch).onConflictDoNothing();
   inserted += batch.length;
   process.stdout.write(`\r  Inserting: ${inserted}/${insertable.length}`);
}

console.log(`\nDone. ${inserted} rows processed.`);
process.exit(0);
