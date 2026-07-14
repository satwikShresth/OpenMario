import type {
   CompactPlan,
   CompactPlanV2,
   CompactQuarter,
   PlanOfStudy,
   PlannedCourse,
   QuarterMode,
} from './types'
import { CODE_TO_MODE, MODE_TO_CODE, TERMS } from './types'
import { CompactPlanV1Schema, CompactPlanV2Schema, createEmptyPlan, parsePlanOfStudy } from './schema'

function quartersFromCompact(
   qs: [CompactQuarter, CompactQuarter, CompactQuarter, CompactQuarter],
   resolve?: (id: string) => PlannedCourse | undefined,
) {
   return TERMS.map((term, i) => {
      const [modeCode, ids] = qs[i]!
      const mode: QuarterMode = CODE_TO_MODE[modeCode] ?? 'courses'
      const courses =
         mode === 'break'
            ? []
            : ids.map(id => {
                 const hit = resolve?.(id)
                 return (
                    hit ?? {
                       id,
                       code: id.slice(0, 8),
                       title: '',
                       credits: null,
                    }
                 )
              })
      return { term, mode, courses }
   })
}

export function toCompactPlan(plan: PlanOfStudy): CompactPlanV2 {
   return {
      v: 2,
      y: plan.years.map(year => {
         const qs = TERMS.map((_, i) => {
            const q = year.quarters[i]!
            const mode = MODE_TO_CODE[q.mode]
            const ids =
               q.mode === 'break' ? [] : q.courses.map(c => c.id).filter(Boolean)
            return [mode, ids] as CompactQuarter
         })
         return [year.fallYear, qs[0]!, qs[1]!, qs[2]!, qs[3]!] as CompactPlanV2['y'][number]
      }),
   }
}

export function fromCompactPlan(
   compact: CompactPlan,
   resolve?: (id: string) => PlannedCourse | undefined,
): PlanOfStudy {
   if (compact.v === 2) {
      return {
         years: compact.y.map(row => {
            const [fallYear, ...qs] = row
            return {
               fallYear,
               quarters: quartersFromCompact(qs as [CompactQuarter, CompactQuarter, CompactQuarter, CompactQuarter], resolve),
            }
         }),
      }
   }

   return {
      years: compact.y.map((qs, i) => ({
         fallYear: compact.s + i,
         quarters: quartersFromCompact(qs, resolve),
      })),
   }
}

export function parseCompactOrFullPlan(raw: unknown): PlanOfStudy | null {
   const v2 = CompactPlanV2Schema.safeParse(raw)
   if (v2.success) return fromCompactPlan(v2.data)
   const v1 = CompactPlanV1Schema.safeParse(raw)
   if (v1.success) return fromCompactPlan(v1.data)
   return parsePlanOfStudy(raw)
}

export function emptyPlanFromCompactOrDefault(startFallYear?: number): PlanOfStudy {
   return createEmptyPlan(startFallYear)
}
