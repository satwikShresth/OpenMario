export const TERMS = ['Fall', 'Winter', 'Spring', 'Summer'] as const
export type TermName = (typeof TERMS)[number]

export type QuarterMode = 'courses' | 'break' | 'coop'

export type PlannedCourse = {
   id: string
   code: string
   title: string
   credits: number | null
}

export type Quarter = {
   term: TermName
   mode: QuarterMode
   courses: PlannedCourse[]
}

/** One academic year row — Fall year is set per row (Fall Y … Summer Y+1). */
export type PlanYear = {
   fallYear: number
   quarters: Quarter[]
}

export type PlanOfStudy = {
   years: PlanYear[]
}

export type StoredPlan = {
   id: string
   name: string
   isDefault: boolean
   updatedAt: string
   plan: PlanOfStudy
}

export type PlanLibrary = {
   version: 2
   plans: StoredPlan[]
}

/**
 * Compact wire v2: each year is [fallYear, qFall, qWinter, qSpring, qSummer]
 * where each q is [modeCode, courseIds[]].
 */
export type CompactPlanV2 = {
   v: 2
   y: CompactYearRow[]
}

export type CompactYearRow = [
   number,
   CompactQuarter,
   CompactQuarter,
   CompactQuarter,
   CompactQuarter,
]

/** Legacy compact (global start Fall). */
export type CompactPlanV1 = {
   v: 1
   s: number
   y: Array<[CompactQuarter, CompactQuarter, CompactQuarter, CompactQuarter]>
}

export type CompactPlan = CompactPlanV1 | CompactPlanV2

/** [modeCode, courseIds] — mode: 0=courses, 1=break, 2=coop */
export type CompactQuarter = [0 | 1 | 2, string[]]

export type PlanLinkAction = 'create' | 'update' | 'replace'

export const MODE_TO_CODE = {
   courses: 0,
   break: 1,
   coop: 2,
} as const satisfies Record<QuarterMode, 0 | 1 | 2>

export const CODE_TO_MODE = {
   0: 'courses',
   1: 'break',
   2: 'coop',
} as const satisfies Record<0 | 1 | 2, QuarterMode>
