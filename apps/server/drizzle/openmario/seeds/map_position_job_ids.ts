import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { db, position, company } from '../../../src/db/index.ts';
import { eq } from 'drizzle-orm';

const PARSED_JOB_DATA_PATH = join(
   process.env.HOME!,
   'Projects',
   'drexel-scraper',
   'src',
   'parsed_job_data.json'
);

const OUTPUT_PATH = join(
   process.env.HOME!,
   'Projects',
   'drexel-scraper',
   'src',
   'position_job_id_mapping.json'
);

console.log('Loading parsed_job_data.json...');
const rawJobs: any[] = JSON.parse(readFileSync(PARSED_JOB_DATA_PATH, 'utf-8'));
console.log(`  Loaded ${rawJobs.length} job entries`);

// Build a lookup: (companyKey, positionKey) -> job_ids[]
const jsonLookup = new Map<string, string[]>();
for (const job of rawJobs) {
   const companyKey = (job['Employer'] ?? '').trim().toLowerCase();
   const positionKey = (job['Position'] ?? '').trim().toLowerCase();
   const mapKey = `${companyKey}|||${positionKey}`;
   if (!jsonLookup.has(mapKey)) {
      jsonLookup.set(mapKey, []);
   }
   jsonLookup.get(mapKey)!.push(String(job['job_id']));
}
console.log(`  Built lookup with ${jsonLookup.size} unique (company, position) pairs`);

console.log('Querying DB for all positions with company names...');
const dbPositions = await db
   .select({
      position_id: position.id,
      position_name: position.name,
      company_name: company.name
   })
   .from(position)
   .innerJoin(company, eq(position.company_id, company.id));
console.log(`  Found ${dbPositions.length} positions in DB`);

const mappings: {
   position_id: string;
   company_name: string;
   position_name: string;
   job_ids: string[];
}[] = [];

let matched = 0;
let unmatched = 0;

for (const row of dbPositions) {
   const companyKey = row.company_name.trim().toLowerCase();
   const positionKey = row.position_name.trim().toLowerCase();
   const mapKey = `${companyKey}|||${positionKey}`;
   const job_ids = jsonLookup.get(mapKey) ?? [];

   mappings.push({
      position_id: row.position_id,
      company_name: row.company_name,
      position_name: row.position_name,
      job_ids
   });

   if (job_ids.length > 0) matched++;
   else unmatched++;
}

console.log(`  Matched: ${matched} positions`);
console.log(`  Unmatched (no job_id found): ${unmatched} positions`);

writeFileSync(OUTPUT_PATH, JSON.stringify(mappings, null, 2), 'utf-8');
console.log(`\nMapping written to: ${OUTPUT_PATH}`);

process.exit(0);
