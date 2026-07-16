/**
 * Reads sections.jsonl and updates existing section rows.
 *
 * Each JSONL line: { crn, subjectCode, courseNumber, section, campus,
 *                    maxEnroll, startTime, endTime, instrType, instrMethod,
 *                    days, building, room, instructors[] }
 *
 * Since the CRNs already exist, this script:
 *   1. Updates mutable fields on the section row.
 *   2. Replaces section_days rows (delete + insert).
 *   3. Replaces instructor_sections rows, resolving instructor names to IDs.
 */

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { section, section_days, instructor, instructor_sections, filterRealInstructorNames } from '@openmario/db';
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

/** Load all instructor names mentioned across all lines → id map, inserting any that are missing */
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
      console.log(`  Inserting ${missing.length} new instructor(s): ${missing.join(', ')}`);

      // Get the current max id to generate sequential IDs
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

async function updateSection(db: ReturnType<typeof getNeonDb>, line: SectionLine, termId: number, instrMap: Map<string, number>) {
   const result = await db
      .update(section)
      .set({
         max_enroll: line.maxEnroll,
         start_time: line.startTime,
         end_time: line.endTime,
         instruction_type: line.instrType,
         instruction_method: line.instrMethod,
      })
      .where(and(eq(section.crn, line.crn), eq(section.term_id, termId)))
      .returning({ id: section.id });

   if (result.length === 0) {
      console.warn(`  CRN ${line.crn} (term ${termId}): not found in section table — skipping`);
      return false;
   }

   const sectionId = result[0]!.id;

   // 2. Replace section_days
   await db.delete(section_days).where(eq(section_days.section_id, sectionId));
   if (line.days.length > 0) {
      await db.insert(section_days).values(
         line.days.map(day => ({ section_id: sectionId, day }))
      );
   }

   // 3. Replace instructor_sections
   await db.delete(instructor_sections).where(eq(instructor_sections.section_id, sectionId));
   const instrIds = line.instructors
      .map(name => instrMap.get(name))
      .filter((id): id is number => id !== undefined);

   if (instrIds.length > 0) {
      await db.insert(instructor_sections).values(
         instrIds.map(instructor_id => ({ instructor_id, section_id: sectionId }))
      );
   }

   return true;
}

async function main() {
   if (!Number.isInteger(TERM_ID) || TERM_ID <= 0) {
      throw new Error('TERM_ID env var must be a positive integer (e.g. 202615)');
   }

   const db = getNeonDb();

   console.log(`Reading ${SECTIONS_FILE}…`);
   const lines = await readJsonl(SECTIONS_FILE);
   console.log(`Loaded ${lines.length} sections from JSONL.`);

   const allInstructorNames = filterRealInstructorNames([
      ...new Set(lines.flatMap(l => l.instructors))
   ]);
   console.log(`Resolving ${allInstructorNames.length} unique instructor names…`);
   const instrMap = await resolveInstructorMap(db, allInstructorNames);
   console.log(`Resolved ${instrMap.size} instructors.`);

   let updated = 0;
   let skipped = 0;
   for (const line of lines) {
      const ok = await updateSection(db, line, TERM_ID, instrMap);
      if (ok) {
         updated++;
         console.log(`  ✓ CRN ${line.crn} — ${line.subjectCode} ${line.courseNumber} §${line.section}`);
      } else {
         skipped++;
      }
   }

   console.log(`\nDone. ${updated} sections updated, ${skipped} skipped.`);
   process.exit(0);
}

main().catch(err => {
   console.error('Fatal:', err);
   process.exit(1);
});
