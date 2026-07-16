/**
 * Reads sections.jsonl and inserts section rows for a given term.
 *
 * Requires TERM_ID env var (e.g. 202615).
 *
 * For each JSONL line:
 *   1. Ensures the term row exists.
 *   2. Resolves course_id from (subjectCode, courseNumber).
 *   3. Inserts the section row (skips if CRN already exists).
 *   4. Inserts section_days and instructor_sections.
 */

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
   section,
   section_days,
   instructor,
   instructor_sections,
   course,
   subject,
   term,
   filterRealInstructorNames
} from '@openmario/db';
import { eq, inArray, sql, and } from 'drizzle-orm';
import { getNeonDb } from '@/db/neon';
import { env } from '@env';
import type { DayOfWeek } from '@/scraper/types';

const SECTIONS_FILE = join(env.DATA_DIR, 'sections.jsonl');
const TERM_ID = Number(process.env.TERM_ID);

interface SectionLine {
   crn: number;
   subjectCode: string;
   courseNumber: string;
   section: string;
   campus: string;
   maxEnroll: number | null;
   startTime: string | null;
   endTime: string | null;
   instrType: string;
   instrMethod: string;
   days: DayOfWeek[];
   building: string;
   room: string;
   instructors: string[];
}

async function readJsonl(filePath: string): Promise<SectionLine[]> {
   const lines: SectionLine[] = [];
   const rl = createInterface({
      input: createReadStream(filePath, 'utf8'),
      crlfDelay: Infinity
   });
   for await (const raw of rl) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      try {
         lines.push(JSON.parse(trimmed) as SectionLine);
      } catch {
         console.warn(`  Skipping malformed line: ${trimmed.slice(0, 80)}`);
      }
   }
   return lines;
}

async function resolveInstructorMap(
   db: ReturnType<typeof getNeonDb>,
   names: string[]
): Promise<Map<string, number>> {
   if (names.length === 0) return new Map();

   const existing = await db
      .select({ id: instructor.id, name: instructor.name })
      .from(instructor)
      .where(inArray(instructor.name, names));

   const map = new Map(existing.map(r => [r.name, r.id]));

   const missing = names.filter(n => !map.has(n));
   if (missing.length > 0) {
      console.log(
         `  Inserting ${missing.length} new instructor(s): ${missing.join(', ')}`
      );

      const [maxRow] = await db
         .select({ maxId: sql<number>`max(${instructor.id})` })
         .from(instructor);
      let nextId = (maxRow?.maxId ?? 0) + 1;

      for (const name of missing) {
         await db.insert(instructor).values({ id: nextId, name });
         map.set(name, nextId);
         nextId++;
      }
   }

   return map;
}

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

   return new Map(rows.map(r => [`${r.subjectId}:${r.number}`, r.id]));
}

async function insertSection(
   db: ReturnType<typeof getNeonDb>,
   line: SectionLine,
   termId: number,
   courseId: string,
   instrMap: Map<string, number>
): Promise<'inserted' | 'skipped'> {
   const existing = await db
      .select({ id: section.id })
      .from(section)
      .where(and(eq(section.crn, line.crn), eq(section.term_id, termId)))
      .limit(1);

   if (existing.length > 0) return 'skipped';

   const sectionId = randomUUID();

   await db.insert(section).values({
      id: sectionId,
      crn: line.crn,
      course_id: courseId,
      subject_code: line.subjectCode,
      course_number: line.courseNumber,
      term_id: termId,
      section: line.section,
      max_enroll: line.maxEnroll,
      start_time: line.startTime,
      end_time: line.endTime,
      instruction_type: line.instrType,
      instruction_method: line.instrMethod
   });

   if (line.days.length > 0) {
      await db.insert(section_days).values(
         line.days.map(day => ({ section_id: sectionId, day }))
      );
   }

   const instrIds = line.instructors
      .map(name => instrMap.get(name))
      .filter((id): id is number => id !== undefined);

   if (instrIds.length > 0) {
      await db.insert(instructor_sections).values(
         instrIds.map(instructor_id => ({
            instructor_id,
            section_id: sectionId
         }))
      );
   }

   return 'inserted';
}

async function main() {
   if (!Number.isInteger(TERM_ID) || TERM_ID <= 0) {
      throw new Error('TERM_ID env var must be a positive integer (e.g. 202615)');
   }

   const db = getNeonDb();

   await db.insert(term).values({ id: TERM_ID }).onConflictDoNothing();
   console.log(`Term ${TERM_ID} ensured.`);

   console.log(`Reading ${SECTIONS_FILE}…`);
   const lines = await readJsonl(SECTIONS_FILE);
   console.log(`Loaded ${lines.length} sections from JSONL.`);

   console.log('Loading course map from DB…');
   const courseMap = await loadCourseMap(db);
   console.log(`Course map loaded: ${courseMap.size} entries.`);

   const allInstructorNames = filterRealInstructorNames([
      ...new Set(lines.flatMap(l => l.instructors))
   ]);
   console.log(`Resolving ${allInstructorNames.length} unique instructor names…`);
   const instrMap = await resolveInstructorMap(db, allInstructorNames);
   console.log(`Resolved ${instrMap.size} instructors.`);

   let inserted = 0;
   let skipped = 0;
   let missingCourse = 0;

   for (const line of lines) {
      const key = `${line.subjectCode}:${line.courseNumber}`;
      const courseId = courseMap.get(key);
      if (!courseId) {
         console.warn(`  Course not found in DB: ${key} — skipping CRN ${line.crn}`);
         missingCourse++;
         continue;
      }

      const result = await insertSection(db, line, TERM_ID, courseId, instrMap);
      if (result === 'inserted') {
         inserted++;
         console.log(
            `  ✓ CRN ${line.crn} — ${line.subjectCode} ${line.courseNumber} §${line.section}`
         );
      } else {
         skipped++;
      }
   }

   console.log(
      `\nDone. ${inserted} inserted, ${skipped} skipped (existing CRN), ${missingCourse} missing course.`
   );
   process.exit(0);
}

main().catch(err => {
   console.error('Fatal:', err);
   process.exit(1);
});
