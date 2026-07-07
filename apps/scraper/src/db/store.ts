/**
 * JSONL store for scraped data.
 *
 *   sections.jsonl        — one CleanSection per line (without offeringHistory)
 *   offering_history.jsonl — one entry per unique (subjectCode, courseNumber), append-once
 */

import { appendFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '@env';
import type { CleanCourse, CleanSection } from '@/scraper/types';

export type { CleanSection, CleanCourse };

function dataDir() {
   return process.env.DATA_DIR ?? env.DATA_DIR;
}

function sectionsFile() {
   return join(dataDir(), 'sections.jsonl');
}

function historyFile() {
   return join(dataDir(), 'offering_history.jsonl');
}

function coursesFile() {
   return join(dataDir(), 'courses.jsonl');
}

function ensureDir() {
   mkdirSync(dataDir(), { recursive: true });
}

/** Keys already written to offering_history.jsonl — loaded once, updated in memory */
const writtenHistoryKeys = new Set<string>();
let historyKeysLoaded = false;

function loadHistoryKeys() {
   if (historyKeysLoaded) return;
   historyKeysLoaded = true;
   if (!existsSync(historyFile())) return;
   for (const line of readFileSync(historyFile(), 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
         const { subjectCode, courseNumber } = JSON.parse(line) as {
            subjectCode: string;
            courseNumber: string;
         };
         writtenHistoryKeys.add(`${subjectCode}:${courseNumber}`);
      } catch {}
   }
}

/** Keys already written to courses.jsonl — loaded once, updated in memory */
const writtenCourseKeys = new Set<string>();
let courseKeysLoaded = false;

function loadCourseKeys() {
   if (courseKeysLoaded) return;
   courseKeysLoaded = true;
   if (!existsSync(coursesFile())) return;
   for (const line of readFileSync(coursesFile(), 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
         const { subjectCode, courseNumber } = JSON.parse(line) as {
            subjectCode: string;
            courseNumber: string;
         };
         writtenCourseKeys.add(`${subjectCode}:${courseNumber}`);
      } catch {}
   }
}

export function appendCourse(course: CleanCourse): void {
   ensureDir();
   loadCourseKeys();

   const key = `${course.subjectCode}:${course.courseNumber}`;
   if (writtenCourseKeys.has(key)) return;

   appendFileSync(coursesFile(), JSON.stringify(course) + '\n');
   writtenCourseKeys.add(key);
}

export function appendSection(section: CleanSection, course?: CleanCourse): void {
   ensureDir();
   loadHistoryKeys();

   const { offeringHistory, ...sectionRow } = section;

   appendFileSync(sectionsFile(), JSON.stringify(sectionRow) + '\n');

   if (course) appendCourse(course);

   const historyKey = `${section.subjectCode}:${section.courseNumber}`;
   if (!writtenHistoryKeys.has(historyKey) && offeringHistory.length > 0) {
      appendFileSync(
         historyFile(),
         JSON.stringify({
            subjectCode: section.subjectCode,
            courseNumber: section.courseNumber,
            history: offeringHistory
         }) + '\n'
      );
      writtenHistoryKeys.add(historyKey);
   }
}
