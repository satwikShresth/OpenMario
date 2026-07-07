import type { Page } from 'playwright';
import type { CleanCourse, CleanSection, DayOfWeek, RawSection } from './types';

const DAY_MAP: Record<string, DayOfWeek> = {
   M: 'Monday',
   T: 'Tuesday',
   W: 'Wednesday',
   R: 'Thursday',
   F: 'Friday',
   S: 'Saturday'
};

/** Parse "06:30 pm - 09:20 pm" into ["18:30:00", "21:20:00"], or null if unparseable */
function parseTimes(times: string): { startTime: string | null; endTime: string | null } {
   const match = times.match(
      /(\d{1,2}):(\d{2})\s*(am|pm)\s*-\s*(\d{1,2}):(\d{2})\s*(am|pm)/i
   );
   if (!match) return { startTime: null, endTime: null };

   const to24 = (h: string, m: string, meridiem: string) => {
      let hour = parseInt(h);
      if (meridiem.toLowerCase() === 'pm' && hour !== 12) hour += 12;
      if (meridiem.toLowerCase() === 'am' && hour === 12) hour = 0;
      return `${String(hour).padStart(2, '0')}:${m}:00`;
   };

   return {
      startTime: to24(match[1]!, match[2]!, match[3]!),
      endTime: to24(match[4]!, match[5]!, match[6]!)
   };
}

/** Parse raw day string e.g. "MWF", "TR", "R" into DayOfWeek[] */
function parseDays(days: string): DayOfWeek[] {
   return days
      .split('')
      .map(ch => DAY_MAP[ch])
      .filter((d): d is DayOfWeek => d !== undefined);
}

function cleanSection(raw: RawSection): CleanSection {
   const { startTime, endTime } = parseTimes(raw.times);
   return {
      crn: raw.crn,
      subjectCode: raw.subjectCode,
      courseNumber: raw.courseNumber,
      section: raw.section,
      campus: raw.campus,
      maxEnroll: raw.maxEnroll,
      startTime,
      endTime,
      instrType: raw.instrType,
      instrMethod: raw.instrMethod,
      days: parseDays(raw.days),
      building: raw.building,
      room: raw.room,
      instructors: raw.instructor
         ? raw.instructor.split(',').map(s => s.trim()).filter(Boolean)
         : [],
      offeringHistory: raw.offeringHistory
   };
}

function parseCredits(raw: string | undefined): {
   credits: string | null;
   creditRange: string | null;
} {
   const value = raw?.trim();
   if (!value) return { credits: null, creditRange: null };
   if (value.includes('-')) return { credits: null, creditRange: value };
   const num = Number.parseFloat(value);
   return Number.isFinite(num)
      ? { credits: num.toFixed(1), creditRange: null }
      : { credits: null, creditRange: value };
}

export function parseCourseDetails(
   detailsText: string,
   sched: { title?: string; credits?: string; subjectCode?: string; courseNumber?: string }
): CleanCourse | null {
   const subjectCode = sched.subjectCode?.trim() ?? '';
   const courseNumber = sched.courseNumber?.trim() ?? '';
   const title = sched.title?.trim() ?? '';
   if (!subjectCode || !courseNumber || !title) return null;

   const description =
      detailsText
         .match(
            /Course Description:\s*\n?([\s\S]*?)(?=\nCredits:|\nCollege:|\nDepartment:|\nRestrictions:|\nRepeat Status:|$)/
         )?.[1]
         ?.trim() ?? null;

   const restrictions =
      detailsText
         .match(
            /Restrictions:\s*\n([\s\S]*?)(?=\nSpecial Approval:|\nCo-Requisites:|\nPre-Requisites:|\nCrosslisted|\nRepeat Status:|$)/
         )?.[1]
         ?.replace(/\n{3,}/g, '\n')
         .trim() || null;

   const repeatStatus =
      detailsText.match(/Repeat Status:\s*(.+)/)?.[1]?.trim() ?? null;

   const creditsFromDetails = detailsText.match(/Credits:\s*([\d.]+\s*-\s*[\d.]+|[\d.]+)/)?.[1]?.trim();
   const { credits, creditRange } = parseCredits(sched.credits ?? creditsFromDetails);

   return {
      subjectCode,
      courseNumber,
      title,
      credits,
      creditRange,
      description,
      restrictions,
      repeatStatus,
      writingIntensive: /writing intensive/i.test(detailsText)
   };
}

async function readCoursePage(page: Page) {
   return page.evaluate(() => {
      const sched: Record<string, string> = {};
      document.querySelectorAll('td.tableHeader').forEach(h => {
         const key = h.textContent?.trim() ?? '';
         const val = h.nextElementSibling?.textContent?.trim() ?? '';
         if (key) sched[key] = val;
      });

      const body = document.body.innerText;
      const start = body.indexOf('Additional Section Details');
      const end = body.indexOf('Course Offering History');
      const detailsText =
         start === -1
            ? ''
            : body.slice(start, end === -1 ? undefined : end);

      return { sched, detailsText };
   });
}

/** Extract course catalog metadata from a loaded /courseDetails page. */
export async function extractCourse(page: Page): Promise<CleanCourse | null> {
   const title = await page.title();
   if (/429|too many requests/i.test(title)) return null;

   const { sched, detailsText } = await readCoursePage(page);
   return parseCourseDetails(detailsText, {
      title: sched['Title'],
      credits: sched['Credits'],
      subjectCode: sched['Subject Code'],
      courseNumber: sched['Course Number']
   });
}

/**
 * Extracts section + course data from a /courseDetails page.
 */
export async function extractSectionAndCourse(
   page: Page
): Promise<{ section: CleanSection; course: CleanCourse } | null> {
   const section = await extractSection(page);
   if (!section) return null;
   const course = await extractCourse(page);
   if (!course) return null;
   return { section, course };
}

/**
 * Extracts all section data from a /courseDetails page.
 * Runs DOM queries inside page.evaluate (browser context), then cleans in Node.
 */
export async function extractSection(page: Page): Promise<CleanSection | null> {
   const raw = await page.evaluate((): RawSection | null => {
      function getSchedule(): Record<string, string> {
         const out: Record<string, string> = {};
         document.querySelectorAll('td.tableHeader').forEach(h => {
            const key = h.textContent?.trim() ?? '';
            const val = h.nextElementSibling?.textContent?.trim() ?? '';
            if (key) out[key] = val;
         });
         return out;
      }

      function getTiming() {
         for (const table of Array.from(document.querySelectorAll('table'))) {
            const header = table.querySelector('tr.tableHeader');
            if (header?.textContent?.includes('Start Date')) {
               const rows = Array.from(table.querySelectorAll('tr.even, tr.odd'));
               return rows.map(row => {
                  const cells = Array.from(row.querySelectorAll('td'));
                  const c = (i: number) => cells[i]?.textContent?.trim() ?? '';
                  return { times: c(2), days: c(3), building: c(4), room: c(5) };
               });
            }
         }
         return [];
      }

      function getHistory() {
         return Array.from(
            document.querySelector('table.historyPanel')
               ?.querySelectorAll('tr.even, tr.odd') ?? []
         ).map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            const c = (i: number) => cells[i]?.textContent?.trim() ?? '';
            return {
               year: c(0),
               fall: c(1) === 'Y',
               winter: c(2) === 'Y',
               spring: c(3) === 'Y',
               summer: c(4) === 'Y'
            };
         });
      }

      const sched = getSchedule();
      const timing = getTiming()[0] ?? { times: '', days: '', building: '', room: '' };
      const crn = parseInt(sched['CRN'] ?? '0') || 0;
      if (!crn) return null;

      return {
         crn,
         subjectCode: sched['Subject Code'] ?? '',
         courseNumber: sched['Course Number'] ?? '',
         section: sched['Section'] ?? '',
         campus: sched['Campus'] ?? '',
         instructor: sched['Instructor(s)'] ?? '',
         instrType: sched['Instruction Type'] ?? '',
         instrMethod: sched['Instruction Method'] ?? '',
         maxEnroll: parseInt(sched['Max Enroll'] ?? '') || null,
         times: timing.times,
         days: timing.days,
         building: timing.building,
         room: timing.room,
         offeringHistory: getHistory()
      };
   });

   if (!raw || raw.crn === 0) return null;
   return cleanSection(raw);
}
