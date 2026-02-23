import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { db, job_posting, job_posting_major, job_experience_levels, position, location, major } from '../../../src/db/index.ts';

const BATCH_SIZE = 100;

const jobPostingData: any[] = JSON.parse(
   readFileSync(join(process.env.HOME!, 'Downloads', 'job_posting.json'), 'utf-8'),
);
const jobPostingMajorData: any[] = JSON.parse(
   readFileSync(join(process.env.HOME!, 'Downloads', 'job_posting_major.json'), 'utf-8'),
);
const jobExperienceLevelsData: any[] = JSON.parse(
   readFileSync(join(process.env.HOME!, 'Downloads', 'job_experience_levels.json'), 'utf-8'),
);

function coerceDates(row: any) {
   const result = { ...row };
   for (const key of ['created_at', 'updated_at']) {
      if (typeof result[key] === 'string') {
         result[key] = new Date(result[key]);
      }
   }
   return result;
}

async function fetchAllIds(table: any, idCol: any): Promise<Set<string>> {
   const rows = await db.select({ id: idCol }).from(table);
   return new Set(rows.map((r: any) => r.id));
}

async function insertInBatches(table: any, data: any[], label: string) {
   console.log(`Inserting ${data.length} rows into ${label}...`);
   let inserted = 0;
   for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE).map(coerceDates);
      await db.insert(table).values(batch).onConflictDoNothing();
      inserted += batch.length;
      process.stdout.write(`\r  ${label}: ${inserted}/${data.length}`);
   }
   console.log(`\n${label} done.`);
}

console.log('Fetching existing position IDs from prod...');
const existingPositionIds = await fetchAllIds(position, position.id);
console.log(`  Found ${existingPositionIds.size} positions`);

console.log('Fetching existing location IDs from prod...');
const existingLocationIds = await fetchAllIds(location, location.id);
console.log(`  Found ${existingLocationIds.size} locations`);

const filteredJobPostings = jobPostingData.filter(row => {
   if (!existingPositionIds.has(row.position_id)) return false;
   if (row.location_id && !existingLocationIds.has(row.location_id)) return false;
   return true;
});

const skippedJobPostings = jobPostingData.length - filteredJobPostings.length;
console.log(`job_posting: ${filteredJobPostings.length} insertable, ${skippedJobPostings} skipped (missing FK)`);

await insertInBatches(job_posting, filteredJobPostings, 'job_posting');

// Build set of inserted job_posting IDs for filtering job_posting_major
const insertedJobIds = new Set(filteredJobPostings.map((r: any) => r.id));

console.log('Fetching existing major IDs from prod...');
const existingMajorIds = await fetchAllIds(major, major.id);
console.log(`  Found ${existingMajorIds.size} majors`);

const filteredMajors = jobPostingMajorData.filter((row: any) =>
   insertedJobIds.has(row.job_posting_id) && existingMajorIds.has(row.major_id),
);

const skippedMajors = jobPostingMajorData.length - filteredMajors.length;
console.log(`job_posting_major: ${filteredMajors.length} insertable, ${skippedMajors} skipped (missing FK)`);

await insertInBatches(job_posting_major, filteredMajors, 'job_posting_major');

// Fetch all existing job_posting IDs from prod (includes previously inserted ones)
console.log('Fetching existing job_posting IDs from prod...');
const existingJobIds = await fetchAllIds(job_posting, job_posting.id);
console.log(`  Found ${existingJobIds.size} job_postings`);

const filteredExperienceLevels = jobExperienceLevelsData.filter((row: any) =>
   existingJobIds.has(row.job_posting_id),
);

const skippedExperienceLevels = jobExperienceLevelsData.length - filteredExperienceLevels.length;
console.log(`job_experience_levels: ${filteredExperienceLevels.length} insertable, ${skippedExperienceLevels} skipped (missing FK)`);

await insertInBatches(job_experience_levels, filteredExperienceLevels, 'job_experience_levels');

console.log('All done.');
process.exit(0);
