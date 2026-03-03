/**
 * JSONL store for scraped data.
 *
 *   sections.jsonl        — one CleanSection per line (without offeringHistory)
 *   offering_history.jsonl — one entry per unique (subjectCode, courseNumber), append-once
 */

import { appendFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '@env';
import type { CleanSection } from '@/scraper/types';

export type { CleanSection };

const DATA_DIR = env.DATA_DIR;
const SECTIONS_FILE = join(DATA_DIR, 'sections.jsonl');
const HISTORY_FILE = join(DATA_DIR, 'offering_history.jsonl');

function ensureDir() {
   mkdirSync(DATA_DIR, { recursive: true });
}

/** Keys already written to offering_history.jsonl — loaded once, updated in memory */
const writtenHistoryKeys = new Set<string>();
let historyKeysLoaded = false;

function loadHistoryKeys() {
   if (historyKeysLoaded) return;
   historyKeysLoaded = true;
   if (!existsSync(HISTORY_FILE)) return;
   for (const line of readFileSync(HISTORY_FILE, 'utf8').split('\n')) {
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

export function appendSection(section: CleanSection): void {
   ensureDir();
   loadHistoryKeys();

   const { offeringHistory, ...sectionRow } = section;

   appendFileSync(SECTIONS_FILE, JSON.stringify(sectionRow) + '\n');

   const historyKey = `${section.subjectCode}:${section.courseNumber}`;
   if (!writtenHistoryKeys.has(historyKey) && offeringHistory.length > 0) {
      appendFileSync(
         HISTORY_FILE,
         JSON.stringify({
            subjectCode: section.subjectCode,
            courseNumber: section.courseNumber,
            history: offeringHistory
         }) + '\n'
      );
      writtenHistoryKeys.add(historyKey);
   }
}
