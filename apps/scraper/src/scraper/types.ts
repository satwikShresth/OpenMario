import type { day_of_week } from '@openmario/db';

export type DayOfWeek = (typeof day_of_week)[number];

export interface OfferingHistoryEntry {
   year: string;
   fall: boolean;
   winter: boolean;
   spring: boolean;
   summer: boolean;
}

/** Shape written to sections.jsonl — maps directly to the section table + related tables */
export interface CleanSection {
   // identity
   crn: number;
   subjectCode: string;
   courseNumber: string;
   section: string;
   // section table columns
   campus: string;
   maxEnroll: number | null;
   startTime: string | null;  // HH:MM:SS
   endTime: string | null;    // HH:MM:SS
   instrType: string;
   instrMethod: string;
   days: DayOfWeek[];
   building: string;
   room: string;
   // instructor_sections (split from comma-separated string)
   instructors: string[];
   // offering history — stored once per unique (subjectCode, courseNumber)
   offeringHistory: OfferingHistoryEntry[];
}

/** Raw shape as returned by page.evaluate — kept internal to extract.ts */
export interface RawSection {
   crn: number;
   subjectCode: string;
   courseNumber: string;
   section: string;
   campus: string;
   instructor: string;
   instrType: string;
   instrMethod: string;
   maxEnroll: number | null;
   times: string;
   days: string;
   building: string;
   room: string;
   offeringHistory: OfferingHistoryEntry[];
}
