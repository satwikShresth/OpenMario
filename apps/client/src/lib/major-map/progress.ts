import type { LetterGrade } from './gpa'
import type { CourseRef, MajorProgram, RequirementBlock } from './types'

export type CourseStatus = 'planned' | 'in_progress' | 'completed'

export type CourseProgress = {
   code: string
   title: string
   status: CourseStatus
   grade?: LetterGrade | null
   credits?: number | null
   /** Placeholder for future RMP-informed workload estimates (hours/week). */
   estimatedHoursPerWeek?: number | null
}

export type WhatIfCourse = {
   id: string
   code: string
   title: string
   credits: number
   projectedGrade: LetterGrade
   /** Soft estimate until RMP difficulty pipeline lands. */
   estimatedHoursPerWeek?: number | null
}

export type MajorMapProgress = {
   version: 1
   programId: string
   /** Keyed by normalized course code (e.g. "CS 164"). */
   courses: Record<string, CourseProgress>
   whatIf: WhatIfCourse[]
   targetGpa: number | null
   /**
    * For `one_of_sequences` blocks: parent block id → chosen child sequence id.
    * Completing the elective requires finishing every course in the chosen sequence.
    */
   selectedSequences: Record<string, string>
}

export function normalizeCourseCode(code: string): string {
   return code.trim().replace(/\s+/g, ' ').toUpperCase()
}

export function createEmptyProgress(programId: string): MajorMapProgress {
   return {
      version: 1,
      programId,
      courses: {},
      whatIf: [],
      targetGpa: null,
      selectedSequences: {},
   }
}

export function collectProgramCourses(program: MajorProgram): CourseRef[] {
   const seen = new Set<string>()
   const out: CourseRef[] = []

   const visitCourse = (course: CourseRef) => {
      const key = normalizeCourseCode(course.code)
      if (seen.has(key)) return
      seen.add(key)
      out.push(course)
   }

   const visitBlock = (block: RequirementBlock) => {
      for (const course of block.courses ?? []) visitCourse(course)
      for (const item of block.items ?? []) {
         if (item.type === 'course') visitCourse(item.course)
         else for (const course of item.courses) visitCourse(course)
      }
      for (const child of block.children ?? []) visitBlock(child)
   }

   for (const block of program.blocks) visitBlock(block)
   return out
}

export function defaultCredits(course?: CourseRef | null, fallback = 3): number {
   return course?.credits ?? fallback
}
