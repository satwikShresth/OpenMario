import type { SalaryOffer } from './types'

const QUEUE_KEY = 'openmario:salary-import-v1'

export type SalaryImportQueue = {
   offers: SalaryOffer[]
   idx: number
}

export function readSalaryQueue(): SalaryImportQueue | null {
   if (typeof sessionStorage === 'undefined') return null
   try {
      const raw = sessionStorage.getItem(QUEUE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as SalaryImportQueue
      if (!Array.isArray(parsed.offers) || parsed.offers.length === 0) return null
      const idx = Math.min(Math.max(0, Number(parsed.idx) || 0), parsed.offers.length - 1)
      return { offers: parsed.offers, idx }
   } catch {
      return null
   }
}

export function writeSalaryQueue(queue: SalaryImportQueue): void {
   sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function clearSalaryQueue(): void {
   sessionStorage.removeItem(QUEUE_KEY)
}

export function currentOffer(queue: SalaryImportQueue): SalaryOffer {
   return queue.offers[queue.idx]!
}

export function advanceSalaryQueue(): SalaryImportQueue | null {
   const queue = readSalaryQueue()
   if (!queue) return null
   if (queue.idx + 1 >= queue.offers.length) {
      clearSalaryQueue()
      return null
   }
   const next = { offers: queue.offers, idx: queue.idx + 1 }
   writeSalaryQueue(next)
   return next
}
