import { stringify as zipsonStringify, parse as zipsonParse } from 'zipson'
import { z } from 'zod'

export const TERMS = ['Fall', 'Winter', 'Spring', 'Summer'] as const
export type TermName = (typeof TERMS)[number]

/** Unavailable block: ISO weekday 0=Sun…6=Sat, local HH:MM times */
export const unavailableBlockSchema = z.object({
   day: z.number().int().min(0).max(6),
   start: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .describe('Local start time HH:MM (24h)'),
   end: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .describe('Local end time HH:MM (24h)'),
   title: z.string().max(80).optional(),
})

export const quarterScheduleInputSchema = z.object({
   term: z.enum(TERMS),
   year: z.number().int().min(2000).max(2100),
   crns: z
      .array(z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]))
      .min(1)
      .max(40)
      .describe('Section CRNs from search_sections for that term'),
   unavailable: z.array(unavailableBlockSchema).max(40).optional().default([]),
   action: z
      .enum(['add', 'replace'])
      .optional()
      .default('add')
      .describe('add keeps existing sections; replace clears planned sections for the term first'),
})

export type UnavailableBlock = z.infer<typeof unavailableBlockSchema>
export type QuarterScheduleInput = z.infer<typeof quarterScheduleInputSchema>

type CompactUnavailable = [number, string, string, string?]
type CompactSchedule = {
   v: 1
   t: 0 | 1 | 2 | 3
   y: number
   s: number[]
   u?: CompactUnavailable[]
   a?: 0 | 1
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
      Array.from(atob(str), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(
         '',
      ),
   )
}

function normalizeCrns(crns: QuarterScheduleInput['crns']): number[] {
   const out: number[] = []
   const seen = new Set<number>()
   for (const raw of crns) {
      const n = typeof raw === 'number' ? raw : Number.parseInt(raw, 10)
      if (!Number.isFinite(n) || n <= 0 || seen.has(n)) continue
      seen.add(n)
      out.push(n)
   }
   return out
}

export function encodeQuarterSchedule(input: QuarterScheduleInput): string {
   const parsed = quarterScheduleInputSchema.parse(input)
   const termIdx = TERMS.indexOf(parsed.term) as 0 | 1 | 2 | 3
   if (termIdx < 0) throw new Error(`Invalid term: ${parsed.term}`)
   const crns = normalizeCrns(parsed.crns)
   if (crns.length === 0) throw new Error('At least one valid CRN is required')

   const compact: CompactSchedule = {
      v: 1,
      t: termIdx,
      y: parsed.year,
      s: crns,
   }
   if (parsed.unavailable.length > 0) {
      compact.u = parsed.unavailable.map(b =>
         b.title ? [b.day, b.start, b.end, b.title] : [b.day, b.start, b.end],
      )
   }
   if (parsed.action === 'replace') compact.a = 1

   return encodeToBinary(zipsonStringify(compact))
}

export function decodeQuarterSchedulePayload(encoded: string): QuarterScheduleInput {
   const candidates = [encoded]
   try {
      const uriDecoded = decodeURIComponent(encoded)
      if (uriDecoded !== encoded) candidates.push(uriDecoded)
   } catch {
      // ignore
   }

   let raw: unknown
   let lastError: unknown
   for (const candidate of candidates) {
      try {
         raw = zipsonParse(decodeFromBinary(candidate))
         break
      } catch (e) {
         lastError = e
      }
   }
   if (raw == null || typeof raw !== 'object') {
      throw lastError instanceof Error
         ? lastError
         : new Error('Invalid quarter schedule payload')
   }

   const c = raw as CompactSchedule
   if (c.v !== 1) throw new Error(`Unsupported schedule payload version: ${String((c as any).v)}`)
   const term = TERMS[c.t]
   if (!term) throw new Error('Invalid term index in schedule payload')

   return quarterScheduleInputSchema.parse({
      term,
      year: c.y,
      crns: c.s,
      unavailable: (c.u ?? []).map(row => ({
         day: row[0],
         start: row[1],
         end: row[2],
         ...(row[3] ? { title: row[3] } : {}),
      })),
      action: c.a === 1 ? 'replace' : 'add',
   })
}

export function decodeQuarterScheduleLink(input: string): {
   schedule: QuarterScheduleInput
   schedule_url: string | null
} {
   const trimmed = input.trim()
   let encoded = trimmed
   let schedule_url: string | null = null

   if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed)
      const fromQuery = url.searchParams.get('schedule')
      if (!fromQuery) throw new Error('URL is missing schedule= query param')
      encoded = fromQuery
      schedule_url = trimmed
   } else if (trimmed.includes('schedule=')) {
      const params = new URLSearchParams(trimmed.includes('?') ? trimmed.split('?')[1] : trimmed)
      const fromQuery = params.get('schedule')
      if (!fromQuery) throw new Error('Could not find schedule= value')
      encoded = fromQuery
   }

   return {
      schedule: decodeQuarterSchedulePayload(encoded),
      schedule_url,
   }
}
