import { stringify as zipsonStringify, parse as zipsonParse } from 'zipson'
import { parseSalaryPayload, toCompactBatch } from './compact'
import type { SalaryBatch, SalaryOffer } from './types'
import { salaryBatchSchema } from './types'

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

export function encodeSalaryBatch(batch: SalaryBatch | { offers: SalaryOffer[] }): string {
   const normalized = salaryBatchSchema.parse(
      'v' in batch ? batch : { v: 1 as const, offers: batch.offers },
   )
   return encodeToBinary(zipsonStringify(toCompactBatch(normalized)))
}

export function decodeSalaryBatch(encoded: string): SalaryBatch | null {
   const candidates = [encoded]
   try {
      const uriDecoded = decodeURIComponent(encoded)
      if (uriDecoded !== encoded) candidates.push(uriDecoded)
   } catch {
      // ignore
   }

   for (const candidate of candidates) {
      try {
         const raw = zipsonParse(decodeFromBinary(candidate))
         const batch = parseSalaryPayload(raw)
         if (batch) return batch
      } catch {
         // try next
      }
   }
   return null
}

export type BuildSalaryShareUrlOptions = {
   origin?: string
   idx?: number
}

export function buildSalaryShareUrl(
   batch: SalaryBatch | { offers: SalaryOffer[] },
   options: BuildSalaryShareUrlOptions = {},
): string {
   const origin =
      options.origin ??
      (typeof window !== 'undefined' ? window.location.origin : 'https://openmario.com')
   const params = new URLSearchParams()
   params.set('salaries', encodeSalaryBatch(batch))
   if (options.idx != null && options.idx > 0) params.set('idx', String(options.idx))
   return `${origin}/salary/report?${params.toString()}`
}
