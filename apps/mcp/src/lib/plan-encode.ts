import { stringify as zipsonStringify, parse as zipsonParse } from 'zipson'

type QuarterMode = 'courses' | 'break' | 'coop'

const MODE_TO_CODE = { courses: 0, break: 1, coop: 2 } as const
const CODE_TO_MODE = { 0: 'courses', 1: 'break', 2: 'coop' } as const
const TERMS = ['Fall', 'Winter', 'Spring', 'Summer'] as const

export type CompactPlanInputYear = {
   fall_year?: number | undefined
   quarters: Array<{
      mode?: QuarterMode
      course_ids: string[]
   }>
}

export type CompactPlanInput = {
   /** @deprecated Prefer per-year fall_year. Used when years omit fall_year. */
   start_fall_year?: number
   years: CompactPlanInputYear[]
}

function encodeToBinary(str: string): string {
   return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/gi, (_, p1) =>
         String.fromCharCode(Number.parseInt(p1, 16)),
      ),
   )
}

function decodeFromBinary(str: string): string {
   return decodeURIComponent(
      Array.from(atob(str), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''),
   )
}

/** Compact v2: per-year Fall year + modes + course UUIDs. */
export function encodeCompactPlan(input: CompactPlanInput): string {
   const base = input.start_fall_year ?? new Date().getFullYear()
   const y = input.years.map((year, yi) => {
      const fallYear = year.fall_year ?? base + yi
      const quarters = [...year.quarters]
      while (quarters.length < 4) quarters.push({ mode: 'courses', course_ids: [] })
      const qs = quarters.slice(0, 4).map(q => {
         const mode = MODE_TO_CODE[q.mode ?? 'courses'] as 0 | 1 | 2
         const ids = mode === 1 ? [] : (q.course_ids ?? []).filter(Boolean)
         return [mode, ids] as [0 | 1 | 2, string[]]
      })
      return [fallYear, qs[0]!, qs[1]!, qs[2]!, qs[3]!] as [
         number,
         [0 | 1 | 2, string[]],
         [0 | 1 | 2, string[]],
         [0 | 1 | 2, string[]],
         [0 | 1 | 2, string[]],
      ]
   })

   return encodeToBinary(zipsonStringify({ v: 2, y }))
}

export type DecodedPlanContext = {
   years: Array<{
      fall_year: number
      label: string
      range: string
      quarters: Array<{
         term: (typeof TERMS)[number]
         calendar_year: number
         mode: QuarterMode
         course_ids: string[]
      }>
   }>
   course_ids: string[]
   action?: string
   name?: string
   plan_id?: string
   set_default?: boolean
}

export function decodePlanPayload(encoded: string): DecodedPlanContext['years'] {
   const candidates = [encoded]
   try {
      const uriDecoded = decodeURIComponent(encoded)
      if (uriDecoded !== encoded) candidates.push(uriDecoded)
   } catch {
      // ignore
   }

   let raw: unknown
   for (const candidate of candidates) {
      try {
         raw = zipsonParse(decodeFromBinary(candidate))
         break
      } catch {
         // try next
      }
   }
   if (!raw || typeof raw !== 'object') throw new Error('Invalid plan payload')

   const obj = raw as { v?: number; s?: number; y?: unknown[] }

   if (obj.v === 2 && Array.isArray(obj.y)) {
      return obj.y.map((row: any) => {
         const fallYear = Number(row[0])
         const quarters = TERMS.map((term, i) => {
            const q = row[i + 1] as [number, string[]]
            const modeCode = (q?.[0] ?? 0) as 0 | 1 | 2
            return {
               term,
               calendar_year: term === 'Fall' ? fallYear : fallYear + 1,
               mode: CODE_TO_MODE[modeCode] ?? 'courses',
               course_ids: modeCode === 1 ? [] : (q?.[1] ?? []),
            }
         })
         return {
            fall_year: fallYear,
            label: `${fallYear}–${String(fallYear + 1).slice(-2)}`,
            range: `Fall ${fallYear} → Summer ${fallYear + 1}`,
            quarters,
         }
      })
   }

   if (obj.v === 1 && typeof obj.s === 'number' && Array.isArray(obj.y)) {
      return obj.y.map((qs: any, yi: number) => {
         const fallYear = obj.s! + yi
         const quarters = TERMS.map((term, i) => {
            const q = qs[i] as [number, string[]]
            const modeCode = (q?.[0] ?? 0) as 0 | 1 | 2
            return {
               term,
               calendar_year: term === 'Fall' ? fallYear : fallYear + 1,
               mode: CODE_TO_MODE[modeCode] ?? 'courses',
               course_ids: modeCode === 1 ? [] : (q?.[1] ?? []),
            }
         })
         return {
            fall_year: fallYear,
            label: `${fallYear}–${String(fallYear + 1).slice(-2)}`,
            range: `Fall ${fallYear} → Summer ${fallYear + 1}`,
            quarters,
         }
      })
   }

   throw new Error('Unrecognized plan payload version')
}

/** Parse a full /courses/plan?... URL or bare encoded plan string. */
export function decodePlanOfStudyLink(urlOrEncoded: string): DecodedPlanContext {
   let encoded = urlOrEncoded.trim()
   let action: string | undefined
   let name: string | undefined
   let plan_id: string | undefined
   let set_default: boolean | undefined

   try {
      const url = new URL(encoded)
      const plan = url.searchParams.get('plan')
      if (plan) encoded = plan
      action = url.searchParams.get('action') ?? undefined
      name = url.searchParams.get('name') ?? undefined
      plan_id = url.searchParams.get('id') ?? undefined
      const d = url.searchParams.get('default')
      if (d != null) set_default = d === '1' || d === 'true'
   } catch {
      // treat as bare encoded payload
   }

   const years = decodePlanPayload(encoded)
   const course_ids = [
      ...new Set(years.flatMap(y => y.quarters.flatMap(q => q.course_ids))),
   ]

   return {
      years,
      course_ids,
      ...(action ? { action } : {}),
      ...(name ? { name } : {}),
      ...(plan_id ? { plan_id } : {}),
      ...(set_default != null ? { set_default } : {}),
   }
}
