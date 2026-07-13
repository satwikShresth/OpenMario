import { stringify as zipsonStringify, parse as zipsonParse } from 'zipson'
import { toCompactPlan, parseCompactOrFullPlan } from './compact'
import type { PlanLinkAction, PlanOfStudy } from './types'

export function encodeToBinary(str: string): string {
   return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/gi, (_, p1) =>
         String.fromCharCode(Number.parseInt(p1, 16)),
      ),
   )
}

export function decodeFromBinary(str: string): string {
   return decodeURIComponent(
      Array.from(atob(str), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''),
   )
}

/** Encode minimum compact payload for share/MCP links. */
export function encodePlan(plan: PlanOfStudy): string {
   return encodeToBinary(zipsonStringify(toCompactPlan(plan)))
}

export function decodePlan(encoded: string): PlanOfStudy | null {
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
         const plan = parseCompactOrFullPlan(raw)
         if (plan) return plan
      } catch {
         // try next
      }
   }
   return null
}

export type BuildShareUrlOptions = {
   action?: PlanLinkAction
   name?: string
   id?: string
   setDefault?: boolean
   origin?: string
}

export function buildShareUrl(
   plan: PlanOfStudy,
   options: BuildShareUrlOptions = {},
): string {
   const origin =
      options.origin ??
      (typeof window !== 'undefined' ? window.location.origin : 'https://openmario.com')
   const params = new URLSearchParams()
   params.set('plan', encodePlan(plan))
   params.set('action', options.action ?? 'create')
   if (options.name) params.set('name', options.name)
   if (options.id) params.set('id', options.id)
   if (options.setDefault) params.set('default', '1')
   return `${origin}/courses/plan?${params.toString()}`
}
