import type { Page } from 'playwright';
import type { CleanSection, DayOfWeek, RawSection } from './types';

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
