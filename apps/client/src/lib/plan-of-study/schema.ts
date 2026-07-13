import { z } from 'zod'
import type { PlanOfStudy, PlanYear, Quarter, TermName } from './types'
import { TERMS } from './types'

const TermSchema = z.enum(TERMS)

const PlannedCourseSchema = z.object({
   id: z.string().min(1),
   code: z.string().min(1),
   title: z.string(),
   credits: z.number().nullable(),
})

const QuarterSchema = z.object({
   term: TermSchema,
   mode: z.enum(['courses', 'break', 'coop']),
   courses: z.array(PlannedCourseSchema),
})

const PlanYearSchema = z.object({
   fallYear: z.number().int().min(2000).max(2100),
   quarters: z.array(QuarterSchema).length(4),
})

export const PlanOfStudySchema = z.object({
   years: z.array(PlanYearSchema).min(1).max(12),
})

/** Legacy global startFallYear shape */
const LegacyPlanSchema = z.object({
   startFallYear: z.number().int().min(2000).max(2100),
   years: z.array(z.array(QuarterSchema).length(4)).min(1).max(12),
})

const CompactQuarterSchema = z.tuple([
   z.union([z.literal(0), z.literal(1), z.literal(2)]),
   z.array(z.string()),
])

export const CompactPlanV1Schema = z.object({
   v: z.literal(1),
   s: z.number().int().min(2000).max(2100),
   y: z.array(z.tuple([
      CompactQuarterSchema,
      CompactQuarterSchema,
      CompactQuarterSchema,
      CompactQuarterSchema,
   ])).min(1).max(12),
})

export const CompactPlanV2Schema = z.object({
   v: z.literal(2),
   y: z
      .array(
         z.tuple([
            z.number().int().min(2000).max(2100),
            CompactQuarterSchema,
            CompactQuarterSchema,
            CompactQuarterSchema,
            CompactQuarterSchema,
         ]),
      )
      .min(1)
      .max(12),
})

export function emptyQuarter(term: TermName): Quarter {
   return { term, mode: 'courses', courses: [] }
}

export function emptyYear(fallYear: number): PlanYear {
   return {
      fallYear,
      quarters: TERMS.map(term => emptyQuarter(term)),
   }
}

export function defaultStartFallYear(now = new Date()): number {
   const year = now.getFullYear()
   const month = now.getMonth()
   return month < 8 ? year : year + 1
}

export function createEmptyPlan(startFallYear = defaultStartFallYear(), yearCount = 4): PlanOfStudy {
   return {
      years: Array.from({ length: yearCount }, (_, i) => emptyYear(startFallYear + i)),
   }
}

function normalizeQuarters(raw: Quarter[]): Quarter[] {
   return TERMS.map((term, i) => {
      const q = raw[i]
      return {
         term,
         mode: q?.mode ?? 'courses',
         courses: q?.courses ?? [],
      }
   })
}

export function parsePlanOfStudy(raw: unknown): PlanOfStudy | null {
   const modern = PlanOfStudySchema.safeParse(raw)
   if (modern.success) {
      return {
         years: modern.data.years.map(y => ({
            fallYear: y.fallYear,
            quarters: normalizeQuarters(y.quarters),
         })),
      }
   }

   const legacy = LegacyPlanSchema.safeParse(raw)
   if (legacy.success) {
      return {
         years: legacy.data.years.map((quarters, i) => ({
            fallYear: legacy.data.startFallYear + i,
            quarters: normalizeQuarters(quarters),
         })),
      }
   }

   return null
}
