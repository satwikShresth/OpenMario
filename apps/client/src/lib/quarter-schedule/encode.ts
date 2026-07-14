import { stringify as zipsonStringify, parse as zipsonParse } from 'zipson'

export const TERMS = ['Fall', 'Winter', 'Spring', 'Summer'] as const
export type TermName = (typeof TERMS)[number]

export type UnavailableBlock = {
   day: number
   start: string
   end: string
   title?: string
}

export type QuarterSchedulePayload = {
   term: TermName
   year: number
   crns: number[]
   unavailable: UnavailableBlock[]
   action: 'add' | 'replace'
}

type CompactUnavailable = [number, string, string, string?]
type CompactSchedule = {
   v: 1
   t: 0 | 1 | 2 | 3
   y: number
   s: number[]
   u?: CompactUnavailable[]
   a?: 0 | 1
}

export function encodeToBinary(str: string): string {
   return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/gi, (_, p1) =>
         String.fromCharCode(Number.parseInt(p1, 16)),
      ),
   )
}

export function decodeFromBinary(str: string): string {
   return decodeURIComponent(
      Array.from(atob(str), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(
         '',
      ),
   )
}

export function encodeQuarterSchedule(payload: QuarterSchedulePayload): string {
   const termIdx = TERMS.indexOf(payload.term) as 0 | 1 | 2 | 3
   if (termIdx < 0) throw new Error(`Invalid term: ${payload.term}`)
   const compact: CompactSchedule = {
      v: 1,
      t: termIdx,
      y: payload.year,
      s: payload.crns,
   }
   if (payload.unavailable.length > 0) {
      compact.u = payload.unavailable.map(b =>
         b.title ? [b.day, b.start, b.end, b.title] : [b.day, b.start, b.end],
      )
   }
   if (payload.action === 'replace') compact.a = 1
   return encodeToBinary(zipsonStringify(compact))
}

export function decodeQuarterSchedule(encoded: string): QuarterSchedulePayload {
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
   if (raw == null || typeof raw !== 'object') {
      throw new Error('Invalid quarter schedule payload')
   }
   const c = raw as CompactSchedule
   if (c.v !== 1) throw new Error(`Unsupported schedule payload version: ${String((c as any).v)}`)
   const term = TERMS[c.t]
   if (!term) throw new Error('Invalid term in schedule payload')

   return {
      term,
      year: c.y,
      crns: (c.s ?? []).map(Number).filter(n => Number.isFinite(n) && n > 0),
      unavailable: (c.u ?? []).map(row => ({
         day: row[0],
         start: row[1],
         end: row[2],
         ...(row[3] ? { title: row[3] } : {}),
      })),
      action: c.a === 1 ? 'replace' : 'add',
   }
}

export function buildQuarterScheduleShareUrl(
   payload: QuarterSchedulePayload,
   baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://openmario.com',
): string {
   const params = new URLSearchParams()
   params.set('schedule', encodeQuarterSchedule(payload))
   return `${baseUrl.replace(/\/$/, '')}/courses/plan/schedule?${params.toString()}`
}
