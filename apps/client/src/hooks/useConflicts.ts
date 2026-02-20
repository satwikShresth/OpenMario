import { useMemo, useEffect, useState } from 'react';
import { useLiveQuery, eq } from '@tanstack/react-db';
import {
   coursesCollection,
   planEventsCollection,
   sectionsCollection,
   termsCollection
} from '@/helpers';
import { getContext } from '@/integrations/tanstack-query/root-provider';
import { orpc } from '@/helpers/rpc';

export type ConflictType =
   | 'duplicate'
   | 'overlap'
   | 'course-overlap'
   | 'duplicate-course'
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

const { queryClient } = getContext();

// Helper: Parse time string to minutes (e.g., "09:30" -> 570)
const parseTimeToMinutes = (timeStr: string): number => {
   const [hours, minutes] = timeStr.split(':').map(Number);
   return hours! * 60 + minutes!;
};

// Helper: Check if two time ranges overlap
const timeRangesOverlap = (
   start1: string,
   end1: string,
   start2: string,
   end2: string
): boolean => {
   const s1 = parseTimeToMinutes(start1);
   const e1 = parseTimeToMinutes(end1);
   const s2 = parseTimeToMinutes(start2);
   const e2 = parseTimeToMinutes(end2);
   // Two time ranges overlap if: start1 < end2 AND start2 < end1
   return s1 < e2 && s2 < e1;
};

// Helper: Check if two events share common days
const hasCommonDays = (days1: string, days2: string): string[] => {
   try {
      const arr1 = JSON.parse(days1);
      const arr2 = JSON.parse(days2);
      return arr1.filter((day: string) => arr2.includes(day));
   } catch {
      return [];
   }
};

// Helper: Extract time and day from timestamp (in local timezone)
const extractTimeFromDate = (date: Date) => {
   const hours = date.getHours();
   const minutes = date.getMinutes();
   const dayOfWeek = date.getDay();
   const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
   ];

   return {
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      dayName: dayNames[dayOfWeek],
      dayOfWeek
   };
};

export function useConflicts(currentTerm: string, currentYear: number) {
   // State for requisite-based conflicts
   const [requisiteConflicts, setRequisiteConflicts] = useState<Conflict[]>([]);

   // Fetch all plan events for the current term with their course info
   const { data: allEventsWithTerms } = useLiveQuery(
      q =>
         q
            .from({ events: planEventsCollection })
            .innerJoin({ term: termsCollection }, ({ events, term }) =>
               eq(events.termId, term.id)
            )
            .leftJoin(
               { sections: sectionsCollection },
               ({ events, sections }) => eq(events.crn, sections.crn)
            )
            .leftJoin({ courses: coursesCollection }, ({ sections, courses }) =>
               eq(sections?.courseId, courses.id)
            )
            .select(({ events, term, courses, sections }) => ({
               ...events,
               termName: term.term,
               termYear: term.year,
               courseId: courses?.id,
               courseName: courses?.title,
               crn: sections?.crn
            })),
      []
   );

   // Fetch all completed courses (courses with completed = true)
   const { data: completedCourses } = useLiveQuery(
      q =>
         q
            .from({ course: coursesCollection })
            .select(({ course }) => ({ ...course }))
            .where(({ course }) => eq(course.completed, true)),
      []
   );

   // Fetch sections that have plan events in the current term
   const { data: plannedSections } = useLiveQuery(
      q =>
         q
            .from({ events: planEventsCollection })
            .innerJoin({ term: termsCollection }, ({ events, term }) =>
               eq(events.termId, term.id)
            )
            .innerJoin(
               { sections: sectionsCollection },
               ({ events, sections }) => eq(events.crn, sections.crn)
            )
            .leftJoin({ courses: coursesCollection }, ({ sections, courses }) =>
               eq(sections.courseId, courses.id)
            )
            .select(({ sections, courses, term }) => ({
               crn: sections.crn,
               courseId: sections.courseId,
               courseName: courses?.title || 'Untitled Course',
               termName: term.term,
               termYear: term.year
            }))
            .where(
               ({ term }) =>
                  eq(term.term, currentTerm) && eq(term.year, currentYear)
            ),
      [currentTerm, currentYear]
   );

   // Extract course events for current term/year
   const courseEvents = useMemo(() => {
      if (!allEventsWithTerms) return [];

      return allEventsWithTerms
         .filter(
            (e: any) =>
               e.type === 'course' &&
               e.termName === currentTerm &&
               e.termYear === currentYear
         )
         .map((e: any) => {
            const startInfo = extractTimeFromDate(new Date(e.start));
            const endInfo = extractTimeFromDate(new Date(e.end));

            return {
               id: e.id,
               courseId: e.courseId || e.crn,
               title: e.courseName || e.title || 'Untitled Course',
               crn: e.crn,
               startTime: startInfo.time,
               endTime: endInfo.time,
               day: startInfo.dayName,
               days: JSON.stringify([startInfo.dayName])
            };
         });
   }, [allEventsWithTerms, currentTerm, currentYear]);

   // Extract unavailable blocks for current term/year
   const unavailableBlocks = useMemo(() => {
      if (!allEventsWithTerms) return [];

      return allEventsWithTerms
         .filter(
            (e: any) =>
               e.type === 'unavailable' &&
               e.termName === currentTerm &&
               e.termYear === currentYear
         )
         .map((e: any) => {
            const startInfo = extractTimeFromDate(new Date(e.start));
            const endInfo = extractTimeFromDate(new Date(e.end));

            return {
               id: e.id,
               startTime: startInfo.time,
               endTime: endInfo.time,
               day: startInfo.dayName,
               days: JSON.stringify([startInfo.dayName])
            };
         });
   }, [allEventsWithTerms, currentTerm, currentYear]);

   // Detect all conflicts
   const conflicts = useMemo((): Conflict[] => {
      const issues: Conflict[] = [];

      console.debug('🔍 Checking conflicts:', {
         courses: courseEvents.length,
         unavailableBlocks: unavailableBlocks.length,
         plannedSections: plannedSections?.length || 0,
         courseDetails: courseEvents.map(c => ({
            title: c.title,
            day: c.day,
            time: `${c.startTime}-${c.endTime}`
         })),
         blockDetails: unavailableBlocks.map(b => ({
            day: b.day,
            time: `${b.startTime}-${b.endTime}`
         }))
      });

      // 1. Check for duplicate courses (same courseId, different CRNs) by section
      if (plannedSections && plannedSections.length > 0) {
         // Get unique sections (deduplicate by CRN)
         const uniqueSectionsMap = new Map();
         plannedSections.forEach((section: any) => {
            if (!uniqueSectionsMap.has(section.crn)) {
               uniqueSectionsMap.set(section.crn, section);
            }
         });
         const uniqueSections = Array.from(uniqueSectionsMap.values());

         // Group sections by courseId
         const courseIdMap = new Map<
            string,
            Array<{ crn: string; courseName: string }>
         >();

         uniqueSections.forEach((section: any) => {
            if (!courseIdMap.has(section.courseId)) {
               courseIdMap.set(section.courseId, []);
            }
            courseIdMap.get(section.courseId)!.push({
               crn: section.crn,
               courseName: section.courseName
            });
         });

         // Check for duplicate courses
         courseIdMap.forEach((sections, courseId) => {
            if (sections.length > 1) {
               console.debug('❌ Found duplicate course conflict:', {
                  courseId,
                  sections: sections.map(s => s.crn)
               });

               issues.push({
                  id: `duplicate-course-${courseId}`,
                  courseId: courseId,
                  courseName: sections[0]!.courseName,
                  type: 'duplicate-course',
                  term: currentTerm,
                  year: currentYear,
                  details: sections.map(s => ({
                     id: s.crn,
                     name: `Section (CRN: ${s.crn})`
                  }))
               });
            }
         });
      }

      // 2. Check each course against unavailable blocks
      courseEvents.forEach(course => {
         unavailableBlocks.forEach(block => {
            // Check if they're on the same day
            const commonDays = hasCommonDays(course.days, block.days);

            if (commonDays.length === 0) {
               return; // Different days, no conflict
            }

            // Check if times overlap
            const timesOverlap = timeRangesOverlap(
               course.startTime,
               course.endTime,
               block.startTime,
               block.endTime
            );

            if (timesOverlap) {
               console.debug('❌ Found unavailable conflict:', {
                  course: course.title,
                  courseTime: `${course.startTime}-${course.endTime}`,
                  blockTime: `${block.startTime}-${block.endTime}`,
                  day: commonDays[0]
               });

               // Check if we already have this conflict
               const existingConflict = issues.find(
                  i =>
                     i.courseId === course.courseId &&
                     i.type === 'unavailable-overlap' &&
                     i.details.some(d => d.id.includes(block.id))
               );

               if (!existingConflict) {
                  issues.push({
                     id: `unavailable-${course.courseId}-${block.id}`,
                     courseId: course.courseId,
                     courseName: course.title,
                     type: 'unavailable-overlap',
                     term: currentTerm,
                     year: currentYear,
                     details: [
                        {
                           id: `detail-${block.id}`,
                           name: `Conflicts with unavailable time on ${commonDays[0]}: ${block.startTime}-${block.endTime}`
                        }
                     ]
                  });
               }
            }
         });
      });

      // 3. Check each course against other courses
      for (let i = 0; i < courseEvents.length; i++) {
         for (let j = i + 1; j < courseEvents.length; j++) {
            const course1 = courseEvents[i]!;
            const course2 = courseEvents[j]!;

            // Skip if same course (already handled in duplicate course check)
            if (course1.courseId === course2.courseId) continue;

            // Check if they're on the same day
            const commonDays = hasCommonDays(course1.days, course2.days);

            if (commonDays.length === 0) {
               continue; // Different days, no conflict
            }

            // Check if times overlap
            const timesOverlap = timeRangesOverlap(
               course1.startTime,
               course1.endTime,
               course2.startTime,
               course2.endTime
            );

            if (timesOverlap) {
               console.debug('❌ Found course-course conflict:', {
                  course1: course1.title,
                  course1Time: `${course1.startTime}-${course1.endTime}`,
                  course2: course2.title,
                  course2Time: `${course2.startTime}-${course2.endTime}`,
                  day: commonDays[0]
               });

               // Add conflict for course1
               const existingConflict1 = issues.find(
                  c =>
                     c.courseId === course1.courseId &&
                     c.type === 'course-overlap' &&
                     c.details.some(d => d.id.includes(course2.courseId))
               );

               if (!existingConflict1) {
                  issues.push({
                     id: `course-overlap-${course1.courseId}-${course2.courseId}`,
                     courseId: course1.courseId,
                     courseName: course1.title,
                     type: 'course-overlap',
                     term: currentTerm,
                     year: currentYear,
                     details: [
                        {
                           id: `detail-${course2.courseId}`,
                           name: `Conflicts with ${course2.title} on ${commonDays[0]}: ${course2.startTime}-${course2.endTime}`
                        }
                     ]
                  });
               }

               // Add conflict for course2
               const existingConflict2 = issues.find(
                  c =>
                     c.courseId === course2.courseId &&
                     c.type === 'course-overlap' &&
                     c.details.some(d => d.id.includes(course1.courseId))
               );

               if (!existingConflict2) {
                  issues.push({
                     id: `course-overlap-${course2.courseId}-${course1.courseId}`,
                     courseId: course2.courseId,
                     courseName: course2.title,
                     type: 'course-overlap',
                     term: currentTerm,
                     year: currentYear,
                     details: [
                        {
                           id: `detail-${course1.courseId}`,
                           name: `Conflicts with ${course1.title} on ${commonDays[0]}: ${course1.startTime}-${course1.endTime}`
                        }
                     ]
                  });
               }
            }
         }
      }

      console.debug('📊 Total conflicts found:', issues.length);
      return issues;
   }, [
      courseEvents,
      unavailableBlocks,
      plannedSections,
      currentTerm,
      currentYear
   ]);

   // Fetch requisites and check for missing prerequisites/corequisites
   useEffect(() => {
      if (!courseEvents || courseEvents.length === 0) {
         setRequisiteConflicts([]);
         return;
      }

      const fetchRequisites = async () => {
         const newConflicts: Conflict[] = [];
         // Include both completed courses (taken) and scheduled courses
         const takenCourseIds = new Set(completedCourses?.map(c => c.id) || []);
         const scheduledCourseIds = new Set(
            courseEvents.map(e => e.courseId).filter(Boolean)
         );

         console.debug('🔍 Taken courses:', Array.from(takenCourseIds));
         console.debug('🔍 Scheduled courses:', Array.from(scheduledCourseIds));

         // Get unique courses (not events) to avoid duplicate prerequisite checks
         // Also exclude exam courses since they don't have prerequisites
         const uniqueCourses = Array.from(
            new Map(
               courseEvents
                  .filter(
                     e => e.courseId && !e.title?.toUpperCase().includes('EXAM')
                  )
                  .map(e => [
                     e.courseId,
                     { courseId: e.courseId, title: e.title }
                  ])
            ).values()
         );

         console.debug(
            `🔍 Checking prerequisites for ${uniqueCourses.length} unique courses (excluding exams)`
         );

         for (const course of uniqueCourses) {
            // Skip if this course is already marked as taken
            if (takenCourseIds.has(course.courseId)) {
               console.debug(
                  `⏭ Skipping ${course.courseId} - already marked as taken`
               );
               continue;
            }

            const [prereqResult, coreqResult] = await Promise.all([
               queryClient
                  .fetchQuery(
                     orpc.course.prerequisites.queryOptions({
                        input: { course_id: course.courseId },
                        staleTime: 5 * 60 * 1000,
                        gcTime: 10 * 60 * 1000,
                     })
                  )
                  .catch(error => {
                     console.error(
                        `Error fetching prerequisites for ${course.courseId}:`,
                        error
                     );
                  }),
               queryClient
                  .fetchQuery(
                     orpc.course.corequisites.queryOptions({
                        input: { course_id: course.courseId },
                        staleTime: 5 * 60 * 1000,
                        gcTime: 10 * 60 * 1000,
                     })
                  )
                  .catch(error => {
                     console.error(
                        `Error fetching corequisites for ${course.courseId}:`,
                        error
                     );
                  }),
            ]);

            const data = {
               prerequisites: prereqResult?.data?.prerequisites ?? [],
               corequisites: coreqResult?.data?.corequisites ?? [],
            };

            // Check for missing corequisites
            if (data?.corequisites && data.corequisites.length > 0) {
               const missingCoreqs = data.corequisites.filter(
                  (coreq: any) =>
                     !scheduledCourseIds.has(coreq.id) &&
                     !takenCourseIds.has(coreq.id)
               );

               if (missingCoreqs.length > 0) {
                  newConflicts.push({
                     id: `missing-coreq-${course.courseId}`,
                     courseId: course.courseId,
                     courseName: course.title,
                     type: 'missing-corequisite',
                     term: currentTerm,
                     year: currentYear,
                     details: missingCoreqs.map((c: any) => ({
                        id: c.id,
                        name: `${c.subjectId} ${c.courseNumber}`,
                        fullData: {
                           ...c,
                           credits: c.credits,
                           name: c.name,
                           title: c.name
                        }
                     }))
                  });
               }
            }

            // Check for missing prerequisites
            if (data?.prerequisites && data.prerequisites.length > 0) {
               // Prerequisites are groups of courses (OR logic within group, AND logic between groups)
               const missingPrereqGroups: any[] = [];

               data.prerequisites.forEach((group: any, groupIdx: number) => {
                  // Check if ANY course in this group is taken or scheduled
                  const hasAnyInGroup = group.some(
                     (prereq: any) =>
                        takenCourseIds.has(prereq.id) ||
                        scheduledCourseIds.has(prereq.id)
                  );

                  if (!hasAnyInGroup) {
                     // None of the courses in this group are satisfied
                     missingPrereqGroups.push({
                        id: `prereq-group-${groupIdx}`,
                        name:
                           group.length === 1
                              ? group[0].name
                              : `One of: ${group.map((p: any) => p.name).join(', ')}`,
                        isGroup: group.length > 1,
                        courses: group.map((p: any) => ({
                           id: p.id,
                           name: `${p.subjectId} ${p.courseNumber}`,
                           fullData: {
                              ...p,
                              credits: p.credits,
                              name: p.name,
                              title: p.name
                           }
                        }))
                     });
                  }
               });

               if (missingPrereqGroups.length > 0) {
                  newConflicts.push({
                     id: `missing-prereq-${course.courseId}`,
                     courseId: course.courseId,
                     courseName: course.title,
                     type: 'missing-prerequisite',
                     term: currentTerm,
                     year: currentYear,
                     details: missingPrereqGroups
                  });
               }
            }
         }

         setRequisiteConflicts(newConflicts);
      };

      fetchRequisites();
   }, [courseEvents, completedCourses, currentTerm, currentYear]);

   // Combine all conflicts
   const allConflicts = useMemo(() => {
      return [...conflicts, ...requisiteConflicts];
   }, [conflicts, requisiteConflicts]);

   // Helper function to check if a courseId has conflicts
   const hasConflict = (courseId: string): boolean => {
      return allConflicts.some(c => c.courseId === courseId);
   };

   return {
      conflicts: allConflicts,
      hasConflict
   };
}
