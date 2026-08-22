import {
   normalizeCourseCode,
   type MajorMapProgress,
} from './progress'
import type { CourseRef, MajorProgram, RequirementBlock } from './types'

export type SequenceOption = {
   id: string
   title: string
   courses: CourseRef[]
}

export type SequenceGroup = {
   parentId: string
   parentTitle: string
   sequences: SequenceOption[]
}

function coursesInBlock(block: RequirementBlock): CourseRef[] {
   const out: CourseRef[] = []
   for (const course of block.courses ?? []) out.push(course)
   for (const item of block.items ?? []) {
      if (item.type === 'course') out.push(item.course)
      else out.push(...item.courses)
   }
   for (const child of block.children ?? []) {
      out.push(...coursesInBlock(child))
   }
   return out
}

function collectGroups(
   blocks: RequirementBlock[],
   out: SequenceGroup[],
): void {
   for (const block of blocks) {
      if (block.kind === 'one_of_sequences' && block.children?.length) {
         out.push({
            parentId: block.id,
            parentTitle: block.title,
            sequences: block.children.map(child => ({
               id: child.id,
               title: child.title,
               courses: coursesInBlock(child),
            })),
         })
      }
      if (block.children?.length) collectGroups(block.children, out)
   }
}

export function findSequenceGroups(program: MajorProgram): SequenceGroup[] {
   const out: SequenceGroup[] = []
   collectGroups(program.blocks, out)
   return out
}

export function findSequenceForCourse(
   program: MajorProgram,
   code: string,
): { group: SequenceGroup; sequence: SequenceOption } | null {
   const key = normalizeCourseCode(code)
   for (const group of findSequenceGroups(program)) {
      for (const sequence of group.sequences) {
         if (sequence.courses.some(c => normalizeCourseCode(c.code) === key)) {
            return { group, sequence }
         }
      }
   }
   return null
}

export function getSelectedSequenceId(
   progress: MajorMapProgress,
   parentId: string,
): string | null {
   return progress.selectedSequences[parentId] ?? null
}

export type SequenceProgress = {
   selectedId: string | null
   selected: SequenceOption | null
   completedCount: number
   totalCount: number
   /** True only when a sequence is chosen and every course in it is completed. */
   isComplete: boolean
   remaining: CourseRef[]
}

export function getSequenceProgress(
   progress: MajorMapProgress,
   group: SequenceGroup,
): SequenceProgress {
   const selectedId = getSelectedSequenceId(progress, group.parentId)
   const selected = group.sequences.find(s => s.id === selectedId) ?? null
   if (!selected) {
      return {
         selectedId: null,
         selected: null,
         completedCount: 0,
         totalCount: 0,
         isComplete: false,
         remaining: [],
      }
   }

   let completedCount = 0
   const remaining: CourseRef[] = []
   for (const course of selected.courses) {
      const entry = progress.courses[normalizeCourseCode(course.code)]
      if (entry?.status === 'completed') completedCount += 1
      else remaining.push(course)
   }

   return {
      selectedId,
      selected,
      completedCount,
      totalCount: selected.courses.length,
      isComplete: selected.courses.length > 0 && remaining.length === 0,
      remaining,
   }
}

/** Courses in sibling sequences that are not the selected one. */
export function isCourseOutsideSelectedSequence(
   progress: MajorMapProgress,
   program: MajorProgram,
   code: string,
): boolean {
   const hit = findSequenceForCourse(program, code)
   if (!hit) return false
   const selected = getSelectedSequenceId(progress, hit.group.parentId)
   if (!selected) return false
   return selected !== hit.sequence.id
}
