/**
 * Reads courses.jsonl and inserts missing course rows.
 *
 * Each JSONL line: CleanCourse
 */

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { course, subject } from '@openmario/db';
import { eq } from 'drizzle-orm';
import { getNeonDb } from '@/db/neon';
import { env } from '@env';
import type { CleanCourse } from '@/scraper/types';

function coursesFile() {
   return join(process.env.DATA_DIR ?? env.DATA_DIR, 'courses.jsonl');
}

async function readJsonl(filePath: string): Promise<CleanCourse[]> {
   const lines: CleanCourse[] = [];
   const rl = createInterface({
      input: createReadStream(filePath, 'utf8'),
      crlfDelay: Infinity
   });
   for await (const raw of rl) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      try {
         lines.push(JSON.parse(trimmed) as CleanCourse);
      } catch {
         console.warn(`  Skipping malformed line: ${trimmed.slice(0, 80)}`);
      }
   }
   return lines;
}

async function loadExistingCourseKeys(
   db: ReturnType<typeof getNeonDb>
): Promise<Set<string>> {
   const rows = await db
      .select({
         subjectId: course.subject_id,
         number: course.course_number
      })
      .from(course);

   return new Set(rows.map(r => `${r.subjectId}:${r.number}`));
}

async function loadSubjectIds(
   db: ReturnType<typeof getNeonDb>
): Promise<Set<string>> {
   const rows = await db.select({ id: subject.id }).from(subject);
   return new Set(rows.map(r => r.id));
}

async function main() {
   const db = getNeonDb();

   console.log(`Reading ${coursesFile()}…`);
   const lines = await readJsonl(coursesFile());
   console.log(`Loaded ${lines.length} courses from JSONL.`);

   const existing = await loadExistingCourseKeys(db);
   const subjects = await loadSubjectIds(db);
   console.log(`Existing courses in DB: ${existing.size}`);

   const byKey = new Map<string, CleanCourse>();
   for (const line of lines) {
      byKey.set(`${line.subjectCode}:${line.courseNumber}`, line);
   }

   let inserted = 0;
   let skipped = 0;
   let missingSubject = 0;

   for (const [key, line] of byKey) {
      if (existing.has(key)) {
         skipped++;
         continue;
      }
      if (!subjects.has(line.subjectCode)) {
         console.warn(`  Subject not found in DB: ${line.subjectCode} — skipping ${key}`);
         missingSubject++;
         continue;
      }

      await db.insert(course).values({
         id: randomUUID(),
         subject_id: line.subjectCode,
         course_number: line.courseNumber,
         title: line.title,
         credits: line.credits,
         credit_range: line.creditRange,
         description: line.description,
         writing_intensive: line.writingIntensive,
         repeat_status: line.repeatStatus,
         restrictions: line.restrictions
      });

      inserted++;
      console.log(`  ✓ ${key} — ${line.title}`);
   }

   console.log(
      `\nDone. ${inserted} inserted, ${skipped} skipped (existing), ${missingSubject} missing subject.`
   );
   process.exit(0);
}

main().catch(err => {
   console.error('Fatal:', err);
   process.exit(1);
});
