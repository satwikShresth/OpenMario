import { useMemo } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import { useQueries } from '@tanstack/react-query'
import { planEventsCollection, coursesTakenCollection, orpc } from '@/helpers'
import type { Conflict } from '@/stores/conflictsStore'

// Helper functions
const timeRangesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours! * 60 + minutes!
  }
  const s1 = parseTime(start1)
  const e1 = parseTime(end1)
  const s2 = parseTime(start2)
  const e2 = parseTime(end2)
  return s1 < e2 && s2 < e1
}

const hasCommonDays = (days1: string, days2: string): string[] => {
  try {
    const arr1 = JSON.parse(days1)
    const arr2 = JSON.parse(days2)
    return arr1.filter((day: string) => arr2.includes(day))
  } catch {
    return []
  }
}

export function useConflicts(currentTerm: string, currentYear: number) {
  // Watch all events from the collection
  const { data: allEvents } = useLiveQuery(
    (q) => q.from({ events: planEventsCollection }),
    []
  )

  // Watch all courses taken from the collection
  const { data: coursesTaken } = useLiveQuery(
    (q) => q.from({ courses: coursesTakenCollection }),
    []
  )

  // Filter events for current term/year (excluding EXAM courses for conflict checking)
  const scheduledEvents = useMemo(() => {
    if (!allEvents) return []
    return allEvents.filter(
      (e: any) =>
        e.type === 'course' &&
        e.term === currentTerm &&
        e.year === currentYear &&
        !e.title?.toUpperCase().includes('EXAM')
    )
  }, [allEvents, currentTerm, currentYear])

  // Get ALL course IDs (including EXAM courses) for corequisite checking
  const allScheduledCourseIds = useMemo(() => {
    if (!allEvents) return []
    const allCourses = allEvents.filter(
      (e: any) =>
        e.type === 'course' &&
        e.term === currentTerm &&
        e.year === currentYear
    )
    return [...new Set(allCourses.map((e: any) => e.courseId).filter(Boolean))]
  }, [allEvents, currentTerm, currentYear])

  // Get unique course IDs (excluding EXAM) for fetching requisites
  const scheduledCourseIds = useMemo(() => {
    return [...new Set(scheduledEvents.map((e: any) => e.courseId).filter(Boolean))]
  }, [scheduledEvents])

  // Fetch requisites for all scheduled courses
  const requisitesQueries = useQueries({
    queries: scheduledCourseIds.map((courseId: string) =>
      orpc.graph.requisites.queryOptions({
        input: { course_id: courseId },
        select: (s) => s.data
      })
    )
  })

  // Extract requisites data for dependency tracking
  const requisitesData = useMemo(() => {
    return requisitesQueries.map(q => q.data)
  }, [requisitesQueries.map(q => q.data).join(',')])

  // Calculate all conflicts
  const conflicts = useMemo((): Conflict[] => {
    if (!scheduledEvents || scheduledEvents.length === 0) return []

    // Check if any requisites queries are still loading
    const anyLoading = requisitesQueries.some(q => q.isLoading)
    if (anyLoading) return []

    const issues: Conflict[] = []
    // Use ALL scheduled course IDs (including EXAM) for corequisite checking
    const scheduledCourseIdSet = new Set(allScheduledCourseIds)

    // 1. Detect duplicates
    const courseTitleMap = new Map<string, Array<{ crn: string; courseId: string }>>()
    scheduledEvents.forEach((event: any) => {
      if (event.title) {
        if (!courseTitleMap.has(event.title)) {
          courseTitleMap.set(event.title, [])
        }
        courseTitleMap.get(event.title)!.push({
          crn: event.crn || '',
          courseId: event.courseId || ''
        })
      }
    })

    courseTitleMap.forEach((sections, courseTitle) => {
      if (sections.length > 1) {
        issues.push({
          id: `duplicate-${sections[0]!.courseId}`,
          courseId: sections[0]!.courseId || '',
          courseName: courseTitle,
          type: 'duplicate',
          term: currentTerm,
          year: currentYear,
          details: sections.map(s => ({ id: s.courseId, name: `Section (CRN: ${s.crn})` }))
        })
      }
    })

    // 2. Detect time overlaps between courses
    for (let i = 0; i < scheduledEvents.length; i++) {
      for (let j = i + 1; j < scheduledEvents.length; j++) {
        const e1 = scheduledEvents[i]
        const e2 = scheduledEvents[j]
        if (!e1 || !e2) continue
        if (
          !e1.days ||
          !e1.startTime ||
          !e1.endTime ||
          !e2.days ||
          !e2.startTime ||
          !e2.endTime
        )
          continue

        const commonDays = hasCommonDays(e1.days, e2.days)
        if (
          commonDays.length > 0 &&
          timeRangesOverlap(e1.startTime, e1.endTime, e2.startTime, e2.endTime)
        ) {
          if (!issues.find(i => i.courseId === e1.courseId && i.type === 'overlap')) {
            issues.push({
              id: `overlap-${e1.courseId}-${e2.courseId}`,
              courseId: e1.courseId || '',
              courseName: e1.title || '',
              type: 'overlap',
              term: currentTerm,
              year: currentYear,
              details: [
                {
                  id: `overlap-${e1.crn}-${e2.crn}`,
                  name: `Time Overlap: ${e2.title} on ${commonDays.join(', ')}`
                }
              ]
            })
          }
        }
      }
    }

    // 2b. Detect overlaps with unavailable time blocks
    const unavailableBlocks = allEvents?.filter(
      (e: any) =>
        e.type === 'unavailable' &&
        e.term === currentTerm &&
        e.year === currentYear
    ) || []

    scheduledEvents.forEach((course: any) => {
      if (!course.days || !course.startTime || !course.endTime) return

      unavailableBlocks.forEach((block: any) => {
        if (!block.days || !block.startTime || !block.endTime) return

        const commonDays = hasCommonDays(course.days, block.days)
        if (
          commonDays.length > 0 &&
          timeRangesOverlap(course.startTime, course.endTime, block.startTime, block.endTime)
        ) {
          if (!issues.find(i => i.courseId === course.courseId && i.type === 'unavailable-overlap')) {
            issues.push({
              id: `unavailable-${course.courseId}-${block.id}`,
              courseId: course.courseId || '',
              courseName: course.title || '',
              type: 'unavailable-overlap',
              term: currentTerm,
              year: currentYear,
              details: [
                {
                  id: `unavailable-${course.crn}-${block.id}`,
                  name: `Conflicts with unavailable time on ${commonDays.join(', ')}`
                }
              ]
            })
          }
        }
      })
    })

    // 3. Detect missing corequisites
    requisitesQueries.forEach((query, index) => {
      const event = scheduledEvents.find((e: any) => e.courseId === scheduledCourseIds[index])
      if (!event) return

      const data = query.data as any
      if (data?.corequisites && data.corequisites.length > 0) {
        const missingCoreqs = data.corequisites.filter(
          (coreq: any) => !scheduledCourseIdSet.has(coreq.id)
        )
        if (missingCoreqs.length > 0) {
          issues.push({
            id: `missing-coreq-${event.courseId}`,
            courseId: event.courseId || '',
            courseName: event.title,
            type: 'missing-corequisite',
            term: currentTerm,
            year: currentYear,
            details: missingCoreqs.map((coreq: any) => ({
              id: coreq.id,
              name: `${coreq.subjectId} ${coreq.courseNumber}`,
              fullData: coreq
            }))
          })
        }
      }
    })

    // 4. Detect missing prerequisites (courses that should have been taken before)
    const takenCourseIds = new Set(coursesTaken?.map((c: any) => c.courseId) || [])
    
    requisitesQueries.forEach((query, index) => {
      const event = scheduledEvents.find((e: any) => e.courseId === scheduledCourseIds[index])
      if (!event) return

      const data = query.data as any
      // Prerequisites is an array of arrays (groups with OR logic)
      if (data?.prerequisites && data.prerequisites.length > 0) {
        // Find unsatisfied groups (where NO course in the group is taken)
        const unsatisfiedGroups: any[] = []
        
        data.prerequisites.forEach((group: any[]) => {
          // For each OR group, check if at least one is satisfied
          const groupSatisfied = group.some((prereq: any) => takenCourseIds.has(prereq.id))
          
          // If this OR group is not satisfied, keep the group structure
          if (!groupSatisfied) {
            unsatisfiedGroups.push(group)
          }
        })
        
        if (unsatisfiedGroups.length > 0) {
          // Store groups in details with special structure
          issues.push({
            id: `missing-prereq-${event.courseId}`,
            courseId: event.courseId || '',
            courseName: event.title,
            type: 'missing-prerequisite',
            term: currentTerm,
            year: currentYear,
            // Store as groups to preserve OR/AND logic
            details: unsatisfiedGroups.map((group, groupIdx) => ({
              id: `group-${groupIdx}`,
              name: 'prerequisite-group',
              isGroup: true,
              courses: group.map((prereq: any) => ({
                id: prereq.id,
                name: `${prereq.subjectId} ${prereq.courseNumber}`,
                fullData: prereq
              }))
            }))
          })
        }
      }
    })

    return issues
  }, [scheduledEvents, scheduledCourseIds, allScheduledCourseIds, requisitesData, coursesTaken, currentTerm, currentYear, allEvents])

  // Helper function to check if a courseId has conflicts
  const hasConflict = (courseId: string): boolean => {
    return conflicts.some(c => c.courseId === courseId)
  }

  return {
    conflicts,
    hasConflict
  }
}

