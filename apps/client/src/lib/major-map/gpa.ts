export const LETTER_GRADES = [
   'A',
   'A-',
   'B+',
   'B',
   'B-',
   'C+',
   'C',
   'C-',
   'D+',
   'D',
   'F',
   'P',
   'NP',
   'W',
] as const

export type LetterGrade = (typeof LETTER_GRADES)[number]

/** Quality points for GPA-bearing grades. Pass / fail / withdraw are excluded. */
export const GRADE_POINTS: Record<LetterGrade, number | null> = {
   A: 4.0,
   'A-': 3.7,
   'B+': 3.3,
   B: 3.0,
   'B-': 2.7,
   'C+': 2.3,
   C: 2.0,
   'C-': 1.7,
   'D+': 1.3,
   D: 1.0,
   F: 0,
   P: null,
   NP: null,
   W: null,
}

export function isGpaBearing(grade: LetterGrade | null | undefined): boolean {
   if (!grade) return false
   return GRADE_POINTS[grade] != null
}

export type GpaCourseInput = {
   credits: number
   grade: LetterGrade | null | undefined
}

export type GpaSummary = {
   gpa: number | null
   qualityPoints: number
   gradedCredits: number
   gradedCourses: number
}

export function computeGpa(courses: GpaCourseInput[]): GpaSummary {
   let qualityPoints = 0
   let gradedCredits = 0
   let gradedCourses = 0

   for (const course of courses) {
      if (course.credits <= 0 || !course.grade) continue
      const points = GRADE_POINTS[course.grade]
      if (points == null) continue
      qualityPoints += points * course.credits
      gradedCredits += course.credits
      gradedCourses += 1
   }

   return {
      gpa: gradedCredits > 0 ? qualityPoints / gradedCredits : null,
      qualityPoints,
      gradedCredits,
      gradedCourses,
   }
}

/** Credits still needed at `targetGrade` to reach `targetGpa` from current totals. */
export function creditsNeededForTarget(opts: {
   currentQualityPoints: number
   currentGradedCredits: number
   targetGpa: number
   targetGrade: LetterGrade
}): number | null {
   const gradePoints = GRADE_POINTS[opts.targetGrade]
   if (gradePoints == null) return null
   if (opts.targetGpa <= 0 || opts.targetGpa > 4) return null
   if (gradePoints <= opts.targetGpa) return null

   const numerator =
      opts.targetGpa * opts.currentGradedCredits - opts.currentQualityPoints
   const denominator = gradePoints - opts.targetGpa
   if (denominator <= 0) return null
   const needed = numerator / denominator
   return needed > 0 ? needed : 0
}

export function formatGpa(gpa: number | null, digits = 2): string {
   if (gpa == null) return '—'
   return gpa.toFixed(digits)
}
