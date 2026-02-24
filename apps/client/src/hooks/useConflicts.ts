import { useEffect, useState } from 'react';
import { useStore } from '@tanstack/react-store';
import { getContext } from '@/integrations/tanstack-query/root-provider';
import { termsStore, useTermByNameYear } from '@/db/stores/terms';
import { sectionsStore } from '@/db/stores/sections';
import { coursesStore } from '@/db/stores/courses';
import { planEventsStore } from '@/db/stores/plan-events';
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

const parseTimeToMinutes = (timeStr: string): number => {
   const [hours, minutes] = timeStr.split(':').map(Number);
   return hours! * 60 + minutes!;
};

const timeRangesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
   return parseTimeToMinutes(start1) < parseTimeToMinutes(end2) &&
      parseTimeToMinutes(start2) < parseTimeToMinutes(end1);
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

const extractTimeFromDate = (date: Date) => {
   const hours = date.getHours();
   const minutes = date.getMinutes();
   const dayOfWeek = date.getDay();
   const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
   return {
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      dayName: dayNames[dayOfWeek],
      dayOfWeek
   };
};

export function useConflicts(currentTerm: string, currentYear: number) {
   const [requisiteConflicts, setRequisiteConflicts] = useState<Conflict[]>([]);

   // Subscribe to raw store maps — O(1) lookups replace SQL JOINs
   const allEventsMap = useStore(planEventsStore);
   const allSectionsMap = useStore(sectionsStore);
   const allCoursesMap = useStore(coursesStore);
   const allTermsMap = useStore(termsStore);
   const currentTermData = useTermByNameYear(currentTerm, currentYear);

   // Materialise enriched event rows (plan_events ⋈ terms ⋈ sections ⋈ courses)
   const allEventsWithTerms = Array.from(allEventsMap.values()).map(e => {
      const term = e.term_id ? allTermsMap.get(e.term_id) : null;
      const section = e.crn ? allSectionsMap.get(e.crn) : null;
      const course = section ? allCoursesMap.get(section.course_id) : null;
      return {
         id: e.id, type: e.type, title: e.title, start: e.start, end: e.end, crn: e.crn,
         term_name: term?.term ?? '', term_year: term?.year ?? 0,
         course_id: course?.id ?? null, course_name: course?.title ?? null,
      };
   });

   // Courses marked as taken
   const completedCourses = Array.from(allCoursesMap.values()).filter(c => c.completed);

   // Sections planned for the current term
   const plannedSections = !currentTermData ? [] : Array.from(allEventsMap.values())
      .filter(e => e.term_id === currentTermData.id && e.crn)
      .map(e => {
         const section = allSectionsMap.get(e.crn!);
         const course = section ? allCoursesMap.get(section.course_id) : null;
         return section
            ? {
                 crn: section.crn,
                 course_id: section.course_id,
                 course_name: course?.title ?? 'Untitled Course',
                 term_name: currentTerm,
                 term_year: currentYear,
              }
            : null;
      })
      .filter(Boolean) as Array<{ crn: string; course_id: string; course_name: string; term_name: string; term_year: number }>;

   const courseEvents = allEventsWithTerms
      .filter(e => e.type === 'course' && e.term_name === currentTerm && e.term_year === currentYear)
      .map(e => {
         const startInfo = extractTimeFromDate(new Date(e.start));
         const endInfo = extractTimeFromDate(new Date(e.end));
         return {
            id: e.id,
            courseId: e.course_id || e.crn || '',
            title: e.course_name || e.title || 'Untitled Course',
            crn: e.crn,
            startTime: startInfo.time,
            endTime: endInfo.time,
            day: startInfo.dayName,
            days: JSON.stringify([startInfo.dayName])
         };
      });

   const unavailableBlocks = allEventsWithTerms
      .filter(e => e.type === 'unavailable' && e.term_name === currentTerm && e.term_year === currentYear)
      .map(e => {
         const startInfo = extractTimeFromDate(new Date(e.start));
         const endInfo = extractTimeFromDate(new Date(e.end));
         return {
            id: e.id, startTime: startInfo.time, endTime: endInfo.time,
            day: startInfo.dayName, days: JSON.stringify([startInfo.dayName])
         };
      });

   const conflicts = ((): Conflict[] => {
      const issues: Conflict[] = [];

      if (plannedSections.length > 0) {
         const uniqueSectionsMap = new Map<string, PlannedSectionRow>();
         plannedSections.forEach(section => {
            if (!uniqueSectionsMap.has(section.crn)) uniqueSectionsMap.set(section.crn, section);
         });
         const uniqueSections = Array.from(uniqueSectionsMap.values());
         const courseIdMap = new Map<string, Array<{ crn: string; courseName: string }>>();
         uniqueSections.forEach(section => {
            if (!courseIdMap.has(section.course_id)) courseIdMap.set(section.course_id, []);
            courseIdMap.get(section.course_id)!.push({ crn: section.crn, courseName: section.course_name });
         });
         courseIdMap.forEach((sections, courseId) => {
            if (sections.length > 1) {
               issues.push({
                  id: `duplicate-course-${courseId}`, courseId, courseName: sections[0]!.courseName,
                  type: 'duplicate-course', term: currentTerm, year: currentYear,
                  details: sections.map(s => ({ id: s.crn, name: `Section (CRN: ${s.crn})` }))
               });
            }
         });
      }

      courseEvents.forEach(course => {
         unavailableBlocks.forEach(block => {
            const commonDays = hasCommonDays(course.days, block.days);
            if (commonDays.length === 0) return;
            if (!timeRangesOverlap(course.startTime, course.endTime, block.startTime, block.endTime)) return;
            const existingConflict = issues.find(
               i => i.courseId === course.courseId && i.type === 'unavailable-overlap' && i.details.some(d => d.id.includes(block.id))
            );
            if (!existingConflict) {
               issues.push({
                  id: `unavailable-${course.courseId}-${block.id}`, courseId: course.courseId,
                  courseName: course.title, type: 'unavailable-overlap', term: currentTerm, year: currentYear,
                  details: [{ id: `detail-${block.id}`, name: `Conflicts with unavailable time on ${commonDays[0]}: ${block.startTime}-${block.endTime}` }]
               });
            }
         });
      });

      for (let i = 0; i < courseEvents.length; i++) {
         for (let j = i + 1; j < courseEvents.length; j++) {
            const course1 = courseEvents[i]!;
            const course2 = courseEvents[j]!;
            if (course1.courseId === course2.courseId) continue;
            const commonDays = hasCommonDays(course1.days, course2.days);
            if (commonDays.length === 0) continue;
            if (!timeRangesOverlap(course1.startTime, course1.endTime, course2.startTime, course2.endTime)) continue;

            if (!issues.find(c => c.courseId === course1.courseId && c.type === 'course-overlap' && c.details.some(d => d.id.includes(course2.courseId)))) {
               issues.push({
                  id: `course-overlap-${course1.courseId}-${course2.courseId}`, courseId: course1.courseId,
                  courseName: course1.title, type: 'course-overlap', term: currentTerm, year: currentYear,
                  details: [{ id: `detail-${course2.courseId}`, name: `Conflicts with ${course2.title} on ${commonDays[0]}: ${course2.startTime}-${course2.endTime}` }]
               });
            }
            if (!issues.find(c => c.courseId === course2.courseId && c.type === 'course-overlap' && c.details.some(d => d.id.includes(course1.courseId)))) {
               issues.push({
                  id: `course-overlap-${course2.courseId}-${course1.courseId}`, courseId: course2.courseId,
                  courseName: course2.title, type: 'course-overlap', term: currentTerm, year: currentYear,
                  details: [{ id: `detail-${course1.courseId}`, name: `Conflicts with ${course1.title} on ${commonDays[0]}: ${course1.startTime}-${course1.endTime}` }]
               });
            }
         }
      }

      return issues;
   })();

   useEffect(() => {
      if (!courseEvents || courseEvents.length === 0) {
         setRequisiteConflicts([]);
         return;
      }

      const fetchRequisites = async () => {
         const newConflicts: Conflict[] = [];
         const takenCourseIds = new Set(completedCourses.map(c => c.id));
         const scheduledCourseIds = new Set(courseEvents.map(e => e.courseId).filter(Boolean));

         const uniqueCourses = Array.from(
            new Map(
               courseEvents
                  .filter(e => e.courseId && !e.title?.toUpperCase().includes('EXAM'))
                  .map(e => [e.courseId, { courseId: e.courseId, title: e.title }])
            ).values()
         );

         for (const course of uniqueCourses) {
            if (takenCourseIds.has(course.courseId)) continue;

            const [prereqResult, coreqResult] = await Promise.all([
               queryClient.fetchQuery(orpc.course.prerequisites.queryOptions({
                  input: { params: { course_id: course.courseId } },
                  staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000
               })).catch(() => undefined),
               queryClient.fetchQuery(orpc.course.corequisites.queryOptions({
                  input: { params: { course_id: course.courseId } },
                  staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000
               })).catch(() => undefined)
            ]);

            const data = {
               prerequisites: prereqResult?.data?.prerequisites ?? [],
               corequisites: coreqResult?.data?.corequisites ?? []
            };

            if (data.corequisites.length > 0) {
               const missingCoreqs = data.corequisites.filter(
                  (coreq: any) => !scheduledCourseIds.has(coreq.id) && !takenCourseIds.has(coreq.id)
               );
               if (missingCoreqs.length > 0) {
                  newConflicts.push({
                     id: `missing-coreq-${course.courseId}`, courseId: course.courseId,
                     courseName: course.title, type: 'missing-corequisite', term: currentTerm, year: currentYear,
                     details: missingCoreqs.map((c: any) => ({
                        id: c.id, name: `${c.subjectId} ${c.courseNumber}`,
                        fullData: { ...c, credits: c.credits, name: c.name, title: c.name }
                     }))
                  });
               }
            }

            if (data.prerequisites.length > 0) {
               const missingPrereqGroups: any[] = [];
               data.prerequisites.forEach((group: any, groupIdx: number) => {
                  const hasAnyInGroup = group.some(
                     (prereq: any) => takenCourseIds.has(prereq.id) || scheduledCourseIds.has(prereq.id)
                  );
                  if (!hasAnyInGroup) {
                     missingPrereqGroups.push({
                        id: `prereq-group-${groupIdx}`,
                        name: group.length === 1 ? group[0].name : `One of: ${group.map((p: any) => p.name).join(', ')}`,
                        isGroup: group.length > 1,
                        courses: group.map((p: any) => ({
                           id: p.id, name: `${p.subjectId} ${p.courseNumber}`,
                           fullData: { ...p, credits: p.credits, name: p.name, title: p.name }
                        }))
                     });
                  }
               });
               if (missingPrereqGroups.length > 0) {
                  newConflicts.push({
                     id: `missing-prereq-${course.courseId}`, courseId: course.courseId,
                     courseName: course.title, type: 'missing-prerequisite', term: currentTerm, year: currentYear,
                     details: missingPrereqGroups
                  });
               }
            }
         }

         setRequisiteConflicts(newConflicts);
      };

      fetchRequisites();
   }, [courseEvents, completedCourses, currentTerm, currentYear]);

   const allConflicts = [...conflicts, ...requisiteConflicts];

   return {
      conflicts: allConflicts,
      hasConflict: (courseId: string) => allConflicts.some(c => c.courseId === courseId)
   };
}
