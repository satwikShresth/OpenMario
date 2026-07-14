import { stringify as zipsonStringify, parse as zipsonParse } from 'zipson'
import { z } from 'zod'

export const COOP_YEAR = ['1st', '2nd', '3rd'] as const
export const COOP_CYCLE = [
   'Fall/Winter',
   'Winter/Spring',
   'Spring/Summer',
   'Summer/Fall',
] as const
export const PROGRAM_LEVEL = ['Undergraduate', 'Graduate'] as const

export const salaryOfferInputSchema = z.object({
   company: z.string().min(3).max(100),
   position: z.string().min(3).max(100),
   location: z
      .string()
      .min(1)
      .describe('Prefer "City, ST" from autocomplete_location'),
   work_hours: z.number().int().min(5).max(60).default(40),
   compensation: z.number().nonnegative().describe('Hourly wage in USD'),
   other_compensation: z.string().max(255).optional().default(''),
   details: z.string().max(255).optional().default(''),
   year: z.number().int().min(2005).max(2100),
   coop_year: z.enum(COOP_YEAR).default('1st'),
   coop_cycle: z.enum(COOP_CYCLE).default('Fall/Winter'),
   program_level: z.enum(PROGRAM_LEVEL).default('Undergraduate'),
})

export type SalaryOfferInput = z.infer<typeof salaryOfferInputSchema>

type CompactOffer = {
   c: string
   p: string
   l: string
   w: number
   $: number
   oc?: string
   d?: string
   y: number
   cy: 0 | 1 | 2
   cc: 0 | 1 | 2 | 3
   pl: 0 | 1
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

function toCompact(offer: SalaryOfferInput): CompactOffer {
   const cy = COOP_YEAR.indexOf(offer.coop_year) as 0 | 1 | 2
   const cc = COOP_CYCLE.indexOf(offer.coop_cycle) as 0 | 1 | 2 | 3
   const pl = PROGRAM_LEVEL.indexOf(offer.program_level) as 0 | 1
   const out: CompactOffer = {
      c: offer.company,
      p: offer.position,
      l: offer.location,
      w: offer.work_hours,
      $: offer.compensation,
      y: offer.year,
      cy,
      cc,
      pl,
   }
   if (offer.other_compensation) out.oc = offer.other_compensation
   if (offer.details) out.d = offer.details
   return out
}

function fromCompact(raw: CompactOffer): SalaryOfferInput {
   return salaryOfferInputSchema.parse({
      company: raw.c,
      position: raw.p,
      location: raw.l,
      work_hours: raw.w,
      compensation: raw.$,
      other_compensation: raw.oc ?? '',
      details: raw.d ?? '',
      year: raw.y,
      coop_year: COOP_YEAR[raw.cy] ?? '1st',
      coop_cycle: COOP_CYCLE[raw.cc] ?? 'Fall/Winter',
      program_level: PROGRAM_LEVEL[raw.pl] ?? 'Undergraduate',
   })
}

export function encodeSalaryOffers(offers: SalaryOfferInput[]): string {
   const normalized = offers.map(o => salaryOfferInputSchema.parse(o))
   return encodeToBinary(zipsonStringify({ v: 1, o: normalized.map(toCompact) }))
}

export function decodeSalaryPayload(encoded: string): SalaryOfferInput[] {
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
   if (!raw || typeof raw !== 'object') throw new Error('Invalid salary payload')

   const obj = raw as { v?: number; o?: CompactOffer[]; offers?: unknown[] }
   if (obj.v === 1 && Array.isArray(obj.o)) {
      return obj.o.map(fromCompact)
   }
   if (Array.isArray(obj.offers)) {
      return obj.offers.map(o => salaryOfferInputSchema.parse(o))
   }
   throw new Error('Unrecognized salary payload version')
}

export function decodeSalaryReportLink(urlOrEncoded: string): {
   offers: SalaryOfferInput[]
   idx?: number
} {
   let encoded = urlOrEncoded.trim()
   let idx: number | undefined

   try {
      const url = new URL(encoded)
      const salaries = url.searchParams.get('salaries')
      if (salaries) encoded = salaries
      const idxParam = url.searchParams.get('idx')
      if (idxParam != null) idx = Number.parseInt(idxParam, 10)
   } catch {
      // bare encoded payload
   }

   const offers = decodeSalaryPayload(encoded)
   return {
      offers,
      ...(idx != null && Number.isFinite(idx) ? { idx } : {}),
   }
}
