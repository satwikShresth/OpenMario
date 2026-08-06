import { createEmptyProgress, type MajorMapProgress } from './progress'
import { LETTER_GRADES, type LetterGrade } from './gpa'

const STORAGE_KEY = 'openmario:major-map-progress-v1'

function isLetterGrade(value: unknown): value is LetterGrade {
   return typeof value === 'string' && (LETTER_GRADES as readonly string[]).includes(value)
}

function parseProgress(raw: unknown, programId: string): MajorMapProgress | null {
   if (!raw || typeof raw !== 'object') return null
   const data = raw as Partial<MajorMapProgress>
   if (data.version !== 1) return null

   const courses: MajorMapProgress['courses'] = {}
   if (data.courses && typeof data.courses === 'object') {
      for (const [key, entry] of Object.entries(data.courses)) {
         if (!entry || typeof entry !== 'object') continue
         const status = entry.status
         if (status !== 'planned' && status !== 'in_progress' && status !== 'completed') {
            continue
         }
         courses[key] = {
            code: typeof entry.code === 'string' ? entry.code : key,
            title: typeof entry.title === 'string' ? entry.title : key,
            status,
            grade: isLetterGrade(entry.grade) ? entry.grade : null,
            credits: typeof entry.credits === 'number' ? entry.credits : null,
            estimatedHoursPerWeek:
               typeof entry.estimatedHoursPerWeek === 'number'
                  ? entry.estimatedHoursPerWeek
                  : null,
         }
      }
   }

   const whatIf = Array.isArray(data.whatIf)
      ? data.whatIf
           .filter(
              (w): w is MajorMapProgress['whatIf'][number] =>
                 !!w &&
                 typeof w.id === 'string' &&
                 typeof w.code === 'string' &&
                 typeof w.title === 'string' &&
                 typeof w.credits === 'number' &&
                 isLetterGrade(w.projectedGrade),
           )
           .map(w => ({
              id: w.id,
              code: w.code,
              title: w.title,
              credits: w.credits,
              projectedGrade: w.projectedGrade,
              estimatedHoursPerWeek:
                 typeof w.estimatedHoursPerWeek === 'number'
                    ? w.estimatedHoursPerWeek
                    : null,
           }))
      : []

   const selectedSequences: Record<string, string> = {}
   if (data.selectedSequences && typeof data.selectedSequences === 'object') {
      for (const [parentId, sequenceId] of Object.entries(data.selectedSequences)) {
         if (typeof sequenceId === 'string' && sequenceId) {
            selectedSequences[parentId] = sequenceId
         }
      }
   }

   return {
      version: 1,
      programId: typeof data.programId === 'string' ? data.programId : programId,
      courses,
      whatIf,
      targetGpa: typeof data.targetGpa === 'number' ? data.targetGpa : null,
      selectedSequences,
   }
}

export function loadProgressFromStorage(programId: string): MajorMapProgress {
   try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return createEmptyProgress(programId)
      const all = JSON.parse(raw) as Record<string, unknown>
      const parsed = parseProgress(all[programId], programId)
      return parsed ?? createEmptyProgress(programId)
   } catch {
      return createEmptyProgress(programId)
   }
}

export function saveProgressToStorage(progress: MajorMapProgress): void {
   try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const all: Record<string, MajorMapProgress> = raw ? JSON.parse(raw) : {}
      all[progress.programId] = progress
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
   } catch {
      // ignore quota / private mode
   }
}
