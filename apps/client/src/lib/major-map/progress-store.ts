import { Store, useStore } from '@tanstack/react-store'
import type { LetterGrade } from './gpa'
import { computeGpa, creditsNeededForTarget, type GpaSummary } from './gpa'
import {
   createEmptyProgress,
   defaultCredits,
   normalizeCourseCode,
   type CourseProgress,
   type CourseStatus,
   type MajorMapProgress,
   type WhatIfCourse,
} from './progress'
import { loadProgressFromStorage, saveProgressToStorage } from './progress-storage'
import { findSequenceForCourse } from './sequences'
import type { CourseRef, MajorProgram } from './types'

function initialProgress(programId: string): MajorMapProgress {
   if (typeof window === 'undefined') return createEmptyProgress(programId)
   return loadProgressFromStorage(programId)
}

/** One store per program id (currently BS CS). */
const stores = new Map<string, Store<MajorMapProgress>>()

export function getProgressStore(programId: string): Store<MajorMapProgress> {
   let store = stores.get(programId)
   if (!store) {
      store = new Store(initialProgress(programId))
      stores.set(programId, store)
   }
   return store
}

function commit(programId: string, next: MajorMapProgress) {
   const store = getProgressStore(programId)
   store.setState(() => next)
   saveProgressToStorage(next)
}

export function useMajorMapProgress(programId: string): MajorMapProgress {
   return useStore(getProgressStore(programId), s => s)
}

export function selectSequence(
   programId: string,
   parentId: string,
   sequenceId: string | null,
) {
   const store = getProgressStore(programId)
   const selectedSequences = { ...store.state.selectedSequences }
   if (sequenceId == null) delete selectedSequences[parentId]
   else selectedSequences[parentId] = sequenceId
   commit(programId, { ...store.state, selectedSequences })
}

/**
 * Mark a course completed/planned. Completing a course inside a sequence elects
 * that sequence (switching away from a prior choice if needed).
 */
export function setCourseStatus(
   programId: string,
   course: CourseRef,
   status: CourseStatus,
   program?: MajorProgram,
) {
   const store = getProgressStore(programId)
   const key = normalizeCourseCode(course.code)
   const prev = store.state.courses[key]
   const nextEntry: CourseProgress = {
      code: course.code,
      title: course.title,
      status,
      grade: status === 'completed' ? (prev?.grade ?? null) : null,
      credits: prev?.credits ?? course.credits ?? null,
      estimatedHoursPerWeek: prev?.estimatedHoursPerWeek ?? null,
   }

   const courses = { ...store.state.courses }
   if (status === 'planned') {
      delete courses[key]
   } else {
      courses[key] = nextEntry
   }

   let selectedSequences = store.state.selectedSequences
   if (status === 'completed' && program) {
      const hit = findSequenceForCourse(program, course.code)
      if (hit) {
         selectedSequences = {
            ...selectedSequences,
            [hit.group.parentId]: hit.sequence.id,
         }
      }
   }

   commit(programId, { ...store.state, courses, selectedSequences })
}

export function setCourseGrade(
   programId: string,
   course: CourseRef,
   grade: LetterGrade | null,
   program?: MajorProgram,
) {
   const store = getProgressStore(programId)
   const key = normalizeCourseCode(course.code)
   const prev = store.state.courses[key]
   const courses = {
      ...store.state.courses,
      [key]: {
         code: course.code,
         title: course.title,
         status: prev?.status === 'in_progress' ? prev.status : 'completed',
         grade,
         credits: prev?.credits ?? course.credits ?? null,
         estimatedHoursPerWeek: prev?.estimatedHoursPerWeek ?? null,
      } satisfies CourseProgress,
   }

   let selectedSequences = store.state.selectedSequences
   if (program) {
      const hit = findSequenceForCourse(program, course.code)
      if (hit) {
         selectedSequences = {
            ...selectedSequences,
            [hit.group.parentId]: hit.sequence.id,
         }
      }
   }

   commit(programId, { ...store.state, courses, selectedSequences })
}

export function setCourseCredits(
   programId: string,
   course: CourseRef,
   credits: number | null,
) {
   const store = getProgressStore(programId)
   const key = normalizeCourseCode(course.code)
   const prev = store.state.courses[key]
   if (!prev) return
   commit(programId, {
      ...store.state,
      courses: {
         ...store.state.courses,
         [key]: { ...prev, credits },
      },
   })
}

export function toggleCourseCompleted(
   programId: string,
   course: CourseRef,
   program?: MajorProgram,
) {
   const store = getProgressStore(programId)
   const key = normalizeCourseCode(course.code)
   const current = store.state.courses[key]
   const nextStatus: CourseStatus =
      current?.status === 'completed' ? 'planned' : 'completed'
   setCourseStatus(programId, course, nextStatus, program)
}

export function setTargetGpa(programId: string, targetGpa: number | null) {
   const store = getProgressStore(programId)
   commit(programId, { ...store.state, targetGpa })
}

export function addWhatIfCourse(
   programId: string,
   course: Omit<WhatIfCourse, 'id'> & { id?: string },
) {
   const store = getProgressStore(programId)
   const entry: WhatIfCourse = {
      id: course.id ?? crypto.randomUUID(),
      code: course.code,
      title: course.title,
      credits: course.credits,
      projectedGrade: course.projectedGrade,
      estimatedHoursPerWeek: course.estimatedHoursPerWeek ?? null,
   }
   commit(programId, { ...store.state, whatIf: [...store.state.whatIf, entry] })
}

export function updateWhatIfCourse(
   programId: string,
   id: string,
   patch: Partial<Omit<WhatIfCourse, 'id'>>,
) {
   const store = getProgressStore(programId)
   commit(programId, {
      ...store.state,
      whatIf: store.state.whatIf.map(w => (w.id === id ? { ...w, ...patch } : w)),
   })
}

export function removeWhatIfCourse(programId: string, id: string) {
   const store = getProgressStore(programId)
   commit(programId, {
      ...store.state,
      whatIf: store.state.whatIf.filter(w => w.id !== id),
   })
}

export function clearWhatIf(programId: string) {
   const store = getProgressStore(programId)
   commit(programId, { ...store.state, whatIf: [] })
}

export function getCompletedGpaInputs(progress: MajorMapProgress) {
   return Object.values(progress.courses)
      .filter(c => c.status === 'completed')
      .map(c => ({
         credits: c.credits ?? defaultCredits(null),
         grade: c.grade ?? null,
      }))
}

export function summarizeProgressGpa(progress: MajorMapProgress): {
   current: GpaSummary
   projected: GpaSummary
   whatIfOnly: GpaSummary
} {
   const completed = getCompletedGpaInputs(progress)
   const whatIf = progress.whatIf.map(w => ({
      credits: w.credits,
      grade: w.projectedGrade,
   }))
   return {
      current: computeGpa(completed),
      projected: computeGpa([...completed, ...whatIf]),
      whatIfOnly: computeGpa(whatIf),
   }
}

/** Running GPA series for charting: logged courses then what-if courses. */
export function buildGpaSeries(progress: MajorMapProgress): Array<{
   label: string
   gpa: number | null
   kind: 'logged' | 'whatIf'
   qualityPoints: number
   gradedCredits: number
}> {
   const logged = Object.values(progress.courses)
      .filter(c => c.status === 'completed')
      .sort((a, b) => a.code.localeCompare(b.code))

   const series: Array<{
      label: string
      gpa: number | null
      kind: 'logged' | 'whatIf'
      qualityPoints: number
      gradedCredits: number
   }> = []

   const running: { credits: number; grade: LetterGrade | null }[] = []

   for (const c of logged) {
      running.push({
         credits: c.credits ?? defaultCredits(null),
         grade: c.grade ?? null,
      })
      const summary = computeGpa(running)
      series.push({
         label: c.code,
         gpa: summary.gpa,
         kind: 'logged',
         qualityPoints: summary.qualityPoints,
         gradedCredits: summary.gradedCredits,
      })
   }

   for (const w of progress.whatIf) {
      running.push({ credits: w.credits, grade: w.projectedGrade })
      const summary = computeGpa(running)
      series.push({
         label: w.code,
         gpa: summary.gpa,
         kind: 'whatIf',
         qualityPoints: summary.qualityPoints,
         gradedCredits: summary.gradedCredits,
      })
   }

   return series
}

export function targetPlanHint(progress: MajorMapProgress, targetGrade: LetterGrade = 'A') {
   const { current } = summarizeProgressGpa(progress)
   if (progress.targetGpa == null || current.gpa == null) return null
   return creditsNeededForTarget({
      currentQualityPoints: current.qualityPoints,
      currentGradedCredits: current.gradedCredits,
      targetGpa: progress.targetGpa,
      targetGrade,
   })
}

export function isCourseCompleted(progress: MajorMapProgress, code: string): boolean {
   const entry = progress.courses[normalizeCourseCode(code)]
   return entry?.status === 'completed'
}

export function getCourseProgress(
   progress: MajorMapProgress,
   code: string,
): CourseProgress | undefined {
   return progress.courses[normalizeCourseCode(code)]
}
