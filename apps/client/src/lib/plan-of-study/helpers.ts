import type { PlanYear, Quarter, QuarterMode, TermName } from './types'

export const NORMAL_CREDIT_SOFT_LIMIT = 20
export const COOP_RESERVED_CREDITS = 16
export const COOP_REMAINING_CREDITS = 4

/** Drexel term-id year for quarters in this academic year row. */
export function academicYearCode(fallYear: number): number {
   return fallYear
}

/** Display calendar year: Fall Y, Winter/Spring/Summer Y+1. */
export function quarterDisplayYear(fallYear: number, term: TermName): number {
   return term === 'Fall' ? fallYear : fallYear + 1
}

/** Human label e.g. "2026–27 (Fall 2026 → Summer 2027)". */
export function planYearLabel(fallYear: number): string {
   return `${fallYear}–${String(fallYear + 1).slice(-2)}`
}

export function planYearRangeText(fallYear: number): string {
   return `Fall ${fallYear} → Summer ${fallYear + 1}`
}

/** Default name for a newly created plan, e.g. "plan #3". */
export function suggestPlanName(existingPlanCount: number): string {
   return `plan #${existingPlanCount + 1}`
}

export function courseCredits(quarter: Quarter): number {
   return quarter.courses.reduce((sum, c) => sum + (c.credits ?? 0), 0)
}

export function quarterLoadCredits(quarter: Quarter): number {
   const course = courseCredits(quarter)
   if (quarter.mode === 'coop') return COOP_RESERVED_CREDITS + course
   if (quarter.mode === 'break') return 0
   return course
}

export function softCreditCap(mode: QuarterMode): number {
   if (mode === 'coop') return COOP_RESERVED_CREDITS + COOP_REMAINING_CREDITS
   if (mode === 'break') return 0
   return NORMAL_CREDIT_SOFT_LIMIT
}

export function isOverSoftCreditLimit(quarter: Quarter): boolean {
   if (quarter.mode === 'break') return quarter.courses.length > 0
   if (quarter.mode === 'coop') return courseCredits(quarter) > COOP_REMAINING_CREDITS
   return courseCredits(quarter) > NORMAL_CREDIT_SOFT_LIMIT
}

export function seasonsFromAvailabilities(
   rows: Array<{ term: string }>,
): TermName[] {
   const map: Record<string, TermName> = {
      '15': 'Fall',
      '25': 'Winter',
      '35': 'Spring',
      '45': 'Summer',
   }
   const found = new Set<TermName>()
   for (const row of rows) {
      const code = String(row.term).slice(-2)
      const season = map[code]
      if (season) found.add(season)
   }
   const order: TermName[] = ['Fall', 'Winter', 'Spring', 'Summer']
   return order.filter(t => found.has(t))
}

export function yearCourseCredits(year: PlanYear | Quarter[]): number {
   const quarters = Array.isArray(year) ? year : year.quarters
   return quarters.reduce((sum, q) => sum + courseCredits(q), 0)
}

export function yearLoadCredits(year: PlanYear | Quarter[]): number {
   const quarters = Array.isArray(year) ? year : year.quarters
   return quarters.reduce((sum, q) => sum + quarterLoadCredits(q), 0)
}

export function canRemoveYear(year: PlanYear): boolean {
   return !year.quarters.some(q => q.courses.length > 0 || q.mode !== 'courses')
}
