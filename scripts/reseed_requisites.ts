/**
 * Re-seed course_prerequisites and course_corequisites from the re-exported CSVs.
 * Run after re-running export_memgraph_to_csv.py with the corrected direction.
 *
 *   python scripts/export_memgraph_to_csv.py
 *   bun --env-file=.env scripts/reseed_requisites.ts
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'csv-parse/sync';
import { db } from '../apps/server/src/db';
import {
   course_corequisites,
   course_prerequisites
} from '../apps/server/src/db/schema/course_tables';

const CSV_DIR = join(import.meta.dir, 'memgraph_csv_export');

const csv = (file: string): Record<string, string>[] =>
   parse(readFileSync(join(CSV_DIR, file)), {
      columns: true,
      skip_empty_lines: true
   });

const bool = (v: string) => v === 'True' || v === 'true';

console.log('Clearing old requisite data...');
await db.delete(course_prerequisites);
await db.delete(course_corequisites);
console.log('✓ cleared');

console.log('Seeding course_prerequisites...');
const prereqs = csv('course_prerequisites.csv');
const BATCH = 500;
for (let i = 0; i < prereqs.length; i += BATCH) {
   await db
      .insert(course_prerequisites)
      .values(
         prereqs.slice(i, i + BATCH).map(r => ({
            course_id: r['course_id']!,
            prerequisite_course_id: r['prerequisite_course_id']!,
            relationship_type: r['relationship_type']!,
            group_id: r['group_id']!,
            can_take_concurrent: bool(r['can_take_concurrent']!),
            minimum_grade: r['minimum_grade'] || null
         }))
      )
      .onConflictDoNothing();
}
console.log(`✓ course_prerequisites (${prereqs.length} rows)`);

console.log('Seeding course_corequisites...');
const coreqs = csv('course_corequisites.csv');
for (let i = 0; i < coreqs.length; i += BATCH) {
   await db
      .insert(course_corequisites)
      .values(
         coreqs.slice(i, i + BATCH).map(r => ({
            course_id: r['course_id']!,
            corequisite_course_id: r['corequisite_course_id']!
         }))
      )
      .onConflictDoNothing();
}
console.log(`✓ course_corequisites (${coreqs.length} rows)`);

console.log('\nDone! Refresh the materialized views:');
console.log('  REFRESH MATERIALIZED VIEW prerequisites_m_view;');
console.log('  REFRESH MATERIALIZED VIEW corequisites_m_view;');
