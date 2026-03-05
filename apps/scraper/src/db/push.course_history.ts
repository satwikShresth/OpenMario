/**
 * Reads offering_history.jsonl and upserts rows into course_history.
 *
 * Each JSONL line: { subjectCode, courseNumber, history: OfferingHistoryEntry[] }
 * Each history entry with a true term becomes one row: (course_id, academic_year, term).
 *
 * Strategy:
 *   1. Load the full course map (subject_id + course_number → uuid) in one query.
 *   2. Expand every JSONL line into INSERT rows in memory.
 *   3. Iterate through courses sequentially, one INSERT per course.
 */

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { course, subject, course_history } from '@openmario/db';
import { eq } from 'drizzle-orm';
import { getNeonDb } from '@/db/neon';
import { env } from '@env';
import type { OfferingHistoryEntry } from '@/scraper/types';

const HISTORY_FILE = join(env.DATA_DIR, 'offering_history.jsonl');

interface HistoryLine {
   subjectCode: string;
   courseNumber: string;
   history: OfferingHistoryEntry[];
}

const TERMS = ['fall', 'winter', 'spring', 'summer'] as const;
type Term = (typeof TERMS)[number];

type CourseRow = { course_id: string; academic_year: string; term: Term };

async function readJsonl(filePath: string): Promise<HistoryLine[]> {
   const lines: HistoryLine[] = [];
   const rl = createInterface({
      input: createReadStream(filePath, 'utf8'),
      crlfDelay: Infinity
   });
   for await (const raw of rl) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      try {
         lines.push(JSON.parse(trimmed) as HistoryLine);
      } catch {
         console.warn(`  Skipping malformed line: ${trimmed.slice(0, 80)}`);
      }
   }
   return lines;
}

/** Load every course once: subject_id:course_number → uuid */
async function loadCourseMap(
   db: ReturnType<typeof getNeonDb>
): Promise<Map<string, string>> {
   const rows = await db
      .select({
         id: course.id,
         subjectId: course.subject_id,
         number: course.course_number
      })
      .from(course)
      .innerJoin(subject, eq(course.subject_id, subject.id));

   const map = new Map<string, string>();
   for (const r of rows) {
      map.set(`${r.subjectId}:${r.number}`, r.id);
   }
   return map;
}

function buildRows(
   courseId: string,
   history: OfferingHistoryEntry[]
): CourseRow[] {
   const rows: CourseRow[] = [];
   for (const entry of history) {
      for (const term of TERMS) {
         if (entry[term]) {
            rows.push({ course_id: courseId, academic_year: entry.year, term });
         }
      }
   }
   return rows;
}

async function main() {
   const db = getNeonDb();

   console.log(`Reading ${HISTORY_FILE}…`);
   const lines = await readJsonl(HISTORY_FILE);
   console.log(`Loaded ${lines.length} courses from JSONL.`);

   console.log('Loading course map from DB…');
   const courseMap = await loadCourseMap(db);
   console.log(`Course map loaded: ${courseMap.size} entries.`);

   type Pending = { line: HistoryLine; rows: CourseRow[] };

   const pending: Pending[] = [];
   let skipped = 0;

   for (const line of lines) {
      const key = `${line.subjectCode}:${line.courseNumber}`;
      const courseId = courseMap.get(key);
      if (!courseId) {
         console.warn(`  Course not found in DB: ${key} — skipping`);
         skipped++;
         continue;
      }
      const rows = buildRows(courseId, line.history);
      if (rows.length > 0) pending.push({ line, rows });
   }

   console.log(`\n${pending.length} courses to insert, ${skipped} skipped.\n`);

   let totalInserted = 0;

   for (const { line, rows } of pending) {
      const key = `${line.subjectCode}:${line.courseNumber}`;
      await db.insert(course_history).values(rows).onConflictDoNothing();
      totalInserted += rows.length;
      console.log(`  ✓ ${key} — ${rows.length} rows`);
   }

   console.log(
      `\nDone. ${totalInserted} rows inserted, ${skipped} courses skipped.`
   );
   process.exit(0);
}

main().catch(err => {
   console.error('Fatal:', err);
   process.exit(1);
});
