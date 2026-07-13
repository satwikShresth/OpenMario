import {
   COOP_CYCLE,
   COOP_YEAR,
   PROGRAM_LEVEL,
   salaryBatchSchema,
   salaryOfferSchema,
   type CompactSalaryBatch,
   type CompactSalaryOffer,
   type SalaryBatch,
   type SalaryOffer,
} from './types'

export function toCompactOffer(offer: SalaryOffer): CompactSalaryOffer {
   const cy = COOP_YEAR.indexOf(offer.coop_year) as 0 | 1 | 2
   const cc = COOP_CYCLE.indexOf(offer.coop_cycle) as 0 | 1 | 2 | 3
   const pl = PROGRAM_LEVEL.indexOf(offer.program_level) as 0 | 1
   const compact: CompactSalaryOffer = {
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
   if (offer.other_compensation) compact.oc = offer.other_compensation
   if (offer.details) compact.d = offer.details
   return compact
}

export function fromCompactOffer(raw: CompactSalaryOffer): SalaryOffer {
   return salaryOfferSchema.parse({
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

export function toCompactBatch(batch: SalaryBatch): CompactSalaryBatch {
   return {
      v: 1,
      o: batch.offers.map(toCompactOffer),
   }
}

export function fromCompactBatch(raw: CompactSalaryBatch): SalaryBatch {
   return salaryBatchSchema.parse({
      v: 1,
      offers: raw.o.map(fromCompactOffer),
   })
}

export function parseSalaryPayload(raw: unknown): SalaryBatch | null {
   if (!raw || typeof raw !== 'object') return null

   // Compact wire format
   if ('v' in raw && (raw as CompactSalaryBatch).v === 1 && Array.isArray((raw as CompactSalaryBatch).o)) {
      try {
         return fromCompactBatch(raw as CompactSalaryBatch)
      } catch {
         return null
      }
   }

   // Friendly full JSON (AI / MCP may pass offers without wrapping)
   if ('offers' in raw && Array.isArray((raw as { offers: unknown }).offers)) {
      try {
         return salaryBatchSchema.parse({
            v: 1,
            offers: (raw as { offers: unknown[] }).offers,
         })
      } catch {
         return null
      }
   }

   if (Array.isArray(raw)) {
      try {
         return salaryBatchSchema.parse({ v: 1, offers: raw })
      } catch {
         return null
      }
   }

   // Single offer object
   try {
      return salaryBatchSchema.parse({
         v: 1,
         offers: [salaryOfferSchema.parse(raw)],
      })
   } catch {
      return null
   }
}
