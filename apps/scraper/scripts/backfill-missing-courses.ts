/**
 * Scrapes catalog metadata for courses missing from the DB, then pushes
 * courses + any still-missing sections for the 2026 terms.
 *
 * Batches by subject; within each batch, groups by term so CRNs match the
 * active TMS session. Subject batches run in parallel (default 3 workers).
 *
 * Usage: bun run scripts/backfill-missing-courses.ts
 * Env:   BACKFILL_CONCURRENCY (default 3)
 */

import { createReadStream, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { chromium, type Page } from 'playwright';
import { course, subject } from '@openmario/db';
import { getNeonDb } from '@/db/neon';
import { AUTH_FILE } from '@/scraper/auth';
import { extractCourse } from '@/scraper/extract';
import { BASE_URL, sleep, withRetry } from '@/scraper/utils';
import { appendCourse } from '@/db/store';
import type { CleanCourse } from '@/scraper/types';

const TERMS = [202615, 202625, 202635] as const;
const SCRAPER_ROOT = join(import.meta.dir, '..');
const DATA_ROOT = join(SCRAPER_ROOT, 'data');
const COURSES_DATA_DIR = join(DATA_ROOT, 'catalog');
const CONCURRENCY = Number.parseInt(process.env.BACKFILL_CONCURRENCY ?? '3', 10);
const DETAIL_DELAY_MS = 150;
const RATE_LIMIT_DELAY_MS = 10_000;

type CourseTarget = {
   subjectCode: string;
   courseNumber: string;
   crn: number;
   key: string;
   termId: number;
};

type SubjectBatch = {
   subjectCode: string;
   collegeId: string;
   courses: CourseTarget[];
};

async function loadExistingCourseKeys(db: ReturnType<typeof getNeonDb>) {
   const rows = await db
      .select({ subjectId: course.subject_id, number: course.course_number })
      .from(course);
   return new Set(rows.map(r => `${r.subjectId}:${r.number}`));
}

async function loadSubjectCollegeMap(db: ReturnType<typeof getNeonDb>) {
   const rows = await db
      .select({ id: subject.id, collegeId: subject.college_id })
      .from(subject);
   return new Map(rows.map(r => [r.id, r.collegeId]));
}

async function loadScrapedCourseKeys(): Promise<Set<string>> {
   const keys = new Set<string>();
   const file = join(COURSES_DATA_DIR, 'courses.jsonl');
   if (!existsSync(file)) return keys;
   const rl = createInterface({
      input: createReadStream(file, 'utf8'),
      crlfDelay: Infinity
   });
   for await (const line of rl) {
      if (!line.trim()) continue;
      try {
         const { subjectCode, courseNumber } = JSON.parse(line) as {
            subjectCode: string;
            courseNumber: string;
         };
         keys.add(`${subjectCode}:${courseNumber}`);
      } catch {}
   }
   return keys;
}

async function collectMissingBatches(
   db: ReturnType<typeof getNeonDb>,
   scraped: Set<string>,
   collegeMap: Map<string, string>
): Promise<SubjectBatch[]> {
   const existing = await loadExistingCourseKeys(db);
   const bySubject = new Map<string, SubjectBatch>();

   for (const termId of TERMS) {
      const file = join(DATA_ROOT, String(termId), 'sections.jsonl');
      const rl = createInterface({
         input: createReadStream(file, 'utf8'),
         crlfDelay: Infinity
      });
      for await (const line of rl) {
         if (!line.trim()) continue;
         const s = JSON.parse(line) as {
            subjectCode: string;
            courseNumber: string;
            crn: number;
         };
         const key = `${s.subjectCode}:${s.courseNumber}`;
         if (existing.has(key) || scraped.has(key)) continue;

         const collegeId = collegeMap.get(s.subjectCode);
         if (!collegeId) continue;

         let batch = bySubject.get(s.subjectCode);
         if (!batch) {
            batch = { subjectCode: s.subjectCode, collegeId, courses: [] };
            bySubject.set(s.subjectCode, batch);
         }

         if (!batch.courses.some(c => c.key === key)) {
            batch.courses.push({
               subjectCode: s.subjectCode,
               courseNumber: s.courseNumber,
               crn: s.crn,
               key,
               termId
            });
         }
      }
   }

   return [...bySubject.values()].sort((a, b) => a.courses.length - b.courses.length);
}

async function setTermContext(
   page: Page,
   termId: number,
   collegeId: string,
   subjectCode: string
) {
   await withRetry(() =>
      page.goto(`${BASE_URL}/collegesSubjects/${termId}?collCode=${collegeId}`, {
         waitUntil: 'domcontentloaded'
      })
   );
   await withRetry(() =>
      page.goto(`${BASE_URL}/courseList/${subjectCode}`, {
         waitUntil: 'domcontentloaded'
      })
   );
}

async function gotoCourseDetails(
   page: Page,
   target: CourseTarget
): Promise<CleanCourse | null> {
   for (let attempt = 0; attempt < 5; attempt++) {
      await withRetry(() =>
         page.goto(
            `${BASE_URL}/courseDetails/${target.crn}?crseNumb=${target.courseNumber}`,
            { waitUntil: 'domcontentloaded' }
         )
      );

      const title = await page.title();
      if (/429|too many requests/i.test(title)) {
         await sleep(RATE_LIMIT_DELAY_MS * (attempt + 1));
         continue;
      }

      const courseData = await extractCourse(page);
      if (courseData) return courseData;

      await sleep(DETAIL_DELAY_MS * (attempt + 2));
   }

   return null;
}

async function scrapeSubjectBatch(
   page: Page,
   batch: SubjectBatch,
   stats: { scraped: number; failed: number },
   failed: CourseTarget[]
) {
   const byTerm = new Map<number, CourseTarget[]>();
   for (const target of batch.courses) {
      const group = byTerm.get(target.termId) ?? [];
      group.push(target);
      byTerm.set(target.termId, group);
   }

   console.log(
      `→ ${batch.subjectCode}: ${batch.courses.length} courses (${byTerm.size} terms)`
   );

   for (const [termId, courses] of byTerm) {
      await setTermContext(page, termId, batch.collegeId, batch.subjectCode);

      for (const target of courses) {
         try {
            const courseData = await gotoCourseDetails(page, target);
            if (!courseData) {
               failed.push(target);
               stats.failed++;
               console.warn(`  ✕ ${target.key}`);
               continue;
            }

            appendCourse(courseData);
            stats.scraped++;
            console.log(`  ✓ ${target.key} — ${courseData.title}`);
         } catch (err) {
            failed.push(target);
            stats.failed++;
            console.warn(
               `  ✕ ${target.key}: ${err instanceof Error ? err.message : String(err)}`
            );
         }

         await sleep(DETAIL_DELAY_MS);
      }
   }
}

async function scrapeMissingCourses(batches: SubjectBatch[]) {
   const browser = await chromium.launch({ headless: true });
   const ctx = await browser.newContext({ storageState: AUTH_FILE });
   const stats = { scraped: 0, failed: 0 };
   const failed: CourseTarget[] = [];

   const queue = [...batches];
   const workers = Array.from({ length: CONCURRENCY }, async (_, workerId) => {
      const page = await ctx.newPage();
      page.setDefaultTimeout(60_000);

      while (queue.length > 0) {
         const batch = queue.shift();
         if (!batch) break;
         await scrapeSubjectBatch(page, batch, stats, failed);
      }

      await page.close();
      console.log(`Worker ${workerId + 1} done`);
   });

   await Promise.all(workers);

   if (failed.length > 0) {
      console.log(`\nRetrying ${failed.length} failed courses serially…`);
      const page = await ctx.newPage();
      page.setDefaultTimeout(60_000);
      const collegeMap = new Map(
         batches.map(b => [b.subjectCode, b.collegeId] as const)
      );

      let currentTerm = 0;
      let currentSubject = '';

      for (const target of failed) {
         const collegeId = collegeMap.get(target.subjectCode)!;
         const subjectCode = target.subjectCode;
         if (currentTerm !== target.termId || currentSubject !== subjectCode) {
            await setTermContext(page, target.termId, collegeId, subjectCode);
            currentTerm = target.termId;
            currentSubject = subjectCode;
         }

         const courseData = await gotoCourseDetails(page, target);
         if (courseData) {
            appendCourse(courseData);
            stats.scraped++;
            stats.failed--;
            console.log(`  ✓ retry ${target.key} — ${courseData.title}`);
         } else {
            console.warn(`  ✕ retry ${target.key}`);
         }

         await sleep(DETAIL_DELAY_MS);
      }

      await page.close();
   }

   await browser.close();
   console.log(`\nScraped ${stats.scraped} courses, ${stats.failed} failed.`);
}

async function runPush(script: string, extraEnv: Record<string, string>) {
   const proc = Bun.spawn(['bun', 'run', script], {
      cwd: SCRAPER_ROOT,
      env: { ...process.env, ...extraEnv },
      stdout: 'inherit',
      stderr: 'inherit'
   });
   const code = await proc.exited;
   if (code !== 0) throw new Error(`${script} failed with exit code ${code}`);
}

async function main() {
   process.env.DATA_DIR = COURSES_DATA_DIR;

   const db = getNeonDb();
   const collegeMap = await loadSubjectCollegeMap(db);
   const scraped = await loadScrapedCourseKeys();
   const batches = await collectMissingBatches(db, scraped, collegeMap);

   const totalCourses = batches.reduce((n, b) => n + b.courses.length, 0);
   console.log(
      `Found ${totalCourses} missing courses in ${batches.length} subject batches ` +
         `(${scraped.size} already in catalog JSONL, concurrency ${CONCURRENCY}).`
   );

   if (totalCourses === 0) {
      console.log('Nothing to scrape.');
   } else {
      console.log(`Writing courses to ${join(COURSES_DATA_DIR, 'courses.jsonl')}`);
      await scrapeMissingCourses(batches);
   }

   console.log('\nPushing courses to DB…');
   await runPush('src/db/push.courses.ts', { DATA_DIR: COURSES_DATA_DIR });

   for (const termId of TERMS) {
      console.log(`\nPushing sections for term ${termId}…`);
      await runPush('src/db/push.sections.ts', {
         TERM_ID: String(termId),
         DATA_DIR: join(DATA_ROOT, String(termId))
      });
   }

   console.log('\nBackfill complete.');
}

main().catch(err => {
   console.error('Fatal:', err);
   process.exit(1);
});
