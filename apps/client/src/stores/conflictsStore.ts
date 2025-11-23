import { Store } from '@tanstack/react-store';
import { planEventsCollection } from '@/helpers/collections';
import { getContext } from '@/integrations/tanstack-query/root-provider';
import { orpc } from '@/helpers/rpc';

const { queryClient } = getContext();

export type ConflictType =
   | 'duplicate'
   | 'overlap'
   | 'missing-corequisite'
   | 'missing-prerequisite'
   | 'unavailable-overlap';

export type Conflict = {
   id: string;
   courseId: string;
   courseName: string;
   type: ConflictType;
   term: string;
   year: number;
   details: Array<{ 
      id: string; 
      name: string; 
      fullData?: any;
      isGroup?: boolean;
      courses?: Array<{ id: string; name: string; fullData?: any }>;
   }>;
};

type ConflictsState = {
   conflicts: Conflict[];
   isLoading: boolean;
   lastUpdated: number | null;
};

// Helper functions
const timeRangesOverlap = (
   start1: string,
   end1: string,
   start2: string,
   end2: string
): boolean => {
   const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours! * 60 + minutes!;
   };
   const s1 = parseTime(start1);
   const e1 = parseTime(end1);
   const s2 = parseTime(start2);
   const e2 = parseTime(end2);
   return s1 < e2 && s2 < e1;
};

const hasCommonDays = (days1: string, days2: string): string[] => {
   try {
      const arr1 = JSON.parse(days1);
      const arr2 = JSON.parse(days2);
      return arr1.filter((day: string) => arr2.includes(day));
   } catch {
      return [];
   }
};

// Create the store
export const conflictsStore = new Store<ConflictsState>({
   conflicts: [],
   isLoading: false,
   lastUpdated: null
});

// Detect duplicate courses (same title, different sections)
function detectDuplicates(
   events: any[],
   term: string,
   year: number
): Conflict[] {
   const conflicts: Conflict[] = [];
   const courseTitleMap = new Map<
      string,
      Array<{ crn: string; courseId: string }>
   >();

   events
      .filter(
         (e: any) =>
            e.type === 'course' &&
            e.term === term &&
            e.year === year &&
            !e.title?.toUpperCase().includes('EXAM')
      )
      .forEach((event: any) => {
         if (event.title) {
            if (!courseTitleMap.has(event.title)) {
               courseTitleMap.set(event.title, []);
            }
            courseTitleMap.get(event.title)!.push({
               crn: event.crn || '',
               courseId: event.courseId || ''
            });
         }
      });

   courseTitleMap.forEach((sections, courseTitle) => {
      if (sections.length > 1) {
         conflicts.push({
            id: `duplicate-${sections[0]!.courseId}`,
            courseId: sections[0]!.courseId,
            courseName: courseTitle,
            type: 'duplicate',
            term,
            year,
            details: sections.map(s => ({
               id: s.courseId,
               name: `Section (CRN: ${s.crn})`
            }))
         });
      }
   });

   return conflicts;
}

// Detect time overlaps between courses
function detectTimeOverlaps(
   events: any[],
   term: string,
   year: number
): Conflict[] {
   const conflicts: Conflict[] = [];
   const courseEvents = events.filter(
      (e: any) =>
         e.type === 'course' &&
         e.term === term &&
         e.year === year &&
         !e.title?.toUpperCase().includes('EXAM')
   );

   for (let i = 0; i < courseEvents.length; i++) {
      for (let j = i + 1; j < courseEvents.length; j++) {
         const e1 = courseEvents[i];
         const e2 = courseEvents[j];
         if (!e1 || !e2) continue;
         if (
            !e1.days ||
            !e1.startTime ||
            !e1.endTime ||
            !e2.days ||
            !e2.startTime ||
            !e2.endTime
         )
            continue;

         const commonDays = hasCommonDays(e1.days, e2.days);
         if (
            commonDays.length > 0 &&
            timeRangesOverlap(
               e1.startTime,
               e1.endTime,
               e2.startTime,
               e2.endTime
            )
         ) {
            if (
               !conflicts.find(
                  c => c.courseId === e1.courseId && c.type === 'overlap'
               )
            ) {
               conflicts.push({
                  id: `overlap-${e1.courseId}-${e2.courseId}`,
                  courseId: e1.courseId,
                  courseName: e1.title || '',
                  type: 'overlap',
                  term,
                  year,
                  details: [
                     {
                        id: `overlap-${e1.crn}-${e2.crn}`,
                        name: `Time Overlap: ${e2.title} on ${commonDays.join(', ')}`
                     }
                  ]
               });
            }
         }
      }
   }

   return conflicts;
}

// Detect missing corequisites
async function detectMissingCorequisites(
   events: any[],
   term: string,
   year: number
): Promise<Conflict[]> {
   const conflicts: Conflict[] = [];
   const scheduledEvents = events.filter(
      (e: any) =>
         e.type === 'course' &&
         e.term === term &&
         e.year === year &&
         !e.title?.toUpperCase().includes('EXAM')
   );

   if (scheduledEvents.length === 0) {
      return conflicts;
   }

   const scheduledCourseIds = new Set(
      scheduledEvents.map((e: any) => e.courseId)
   );

   // Fetch requisites for all scheduled courses
   const requisitesPromises = scheduledEvents.map(async (event: any) => {
      try {
         const data = await queryClient.fetchQuery({
            queryKey: ['requisites', event.courseId],
            queryFn: async () => {
               const result = await orpc.graph.requisites({
                  course_id: event.courseId
               });
               return result.data;
            },
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000
         });

         if (data?.corequisites && data.corequisites.length > 0) {
            const missingCoreqs = data.corequisites.filter(
               (coreq: any) => !scheduledCourseIds.has(coreq.id)
            );

            if (missingCoreqs.length > 0) {
               return {
                  id: `missing-coreq-${event.courseId}`,
                  courseId: event.courseId,
                  courseName: event.title,
                  type: 'missing-corequisite' as ConflictType,
                  term,
                  year,
                  details: missingCoreqs.map((c: any) => ({
                     id: c.id,
                     name: `${c.subjectId} ${c.courseNumber}`
                  }))
               };
            }
         }
      } catch {
         // Ignore errors for individual courses
      }
      return null;
   });

   const results = await Promise.all(requisitesPromises);
   return results.filter((r): r is Conflict => r !== null);
}

// Calculate all conflicts for a given term/year
export async function calculateConflicts(term: string, year: number) {
   conflictsStore.setState(state => ({ ...state, isLoading: true }));

   try {
      const events = planEventsCollection.toArray;

      // Run all detection in parallel
      const [duplicates, overlaps, missingCoreqs] = await Promise.all([
         Promise.resolve(detectDuplicates(events, term, year)),
         Promise.resolve(detectTimeOverlaps(events, term, year)),
         detectMissingCorequisites(events, term, year)
      ]);

      const allConflicts = [...duplicates, ...overlaps, ...missingCoreqs];

      conflictsStore.setState({
         conflicts: allConflicts,
         isLoading: false,
         lastUpdated: Date.now()
      });
   } catch (error) {
      console.error('Error calculating conflicts:', error);
      conflictsStore.setState(state => ({ ...state, isLoading: false }));
   }
}

// Subscribe to collection changes
let unsubscribe: (() => void) | null = null;

export function startConflictsSync(term: string, year: number) {
   // Stop existing subscription
   if (unsubscribe) {
      unsubscribe();
   }

   // Initial calculation
   calculateConflicts(term, year);

   // Subscribe to changes
   unsubscribe = planEventsCollection.subscribe(() => {
      calculateConflicts(term, year);
   });

   return () => {
      if (unsubscribe) {
         unsubscribe();
         unsubscribe = null;
      }
   };
}

// Get conflicts for a specific term/year
export function getConflictsForTerm(term: string, year: number): Conflict[] {
   return conflictsStore.state.conflicts.filter(
      c => c.term === term && c.year === year
   );
}

// Get conflict count
export function getConflictCount(term: string, year: number): number {
   return getConflictsForTerm(term, year).length;
}
