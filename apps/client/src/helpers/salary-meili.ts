import type {
   CompanyDocument,
   LocationDocument,
   PositionDocument,
} from '@openmario/meilisearch'
import { INDEX_NAMES } from '@openmario/meilisearch'

export type EntityOption = {
   value: string
   label: string
   variant: 'subtle'
}

/** Algolia-compatible InstantSearch client (from instant-meilisearch). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SearchClient = { search: (...args: any[]) => Promise<any> }

async function meiliHits<T>(
   searchClient: SearchClient,
   indexName: string,
   query: string,
   opts?: { filter?: string; limit?: number },
): Promise<T[]> {
   const q = query.trim()
   if (q.length < 1) return []

   const { results } = await searchClient.search([
      {
         indexName,
         params: {
            query: q,
            hitsPerPage: opts?.limit ?? 10,
            ...(opts?.filter ? { filters: opts.filter } : {}),
         },
      },
   ])

   const hits = (results?.[0] as { hits?: T[] } | undefined)?.hits
   return hits ?? []
}

export async function searchCompanyOptions(
   searchClient: SearchClient,
   query: string,
): Promise<EntityOption[]> {
   const hits = await meiliHits<CompanyDocument>(
      searchClient,
      INDEX_NAMES.companies,
      query,
   )
   return hits.map(h => ({
      value: h.company_id,
      label: h.company_name,
      variant: 'subtle' as const,
   }))
}

export async function searchPositionOptions(
   searchClient: SearchClient,
   query: string,
   companyId: string,
): Promise<EntityOption[]> {
   if (!companyId) return []
   const hits = await meiliHits<PositionDocument>(
      searchClient,
      INDEX_NAMES.positions,
      query,
      { filter: `company_id = "${companyId}"` },
   )
   return hits.map(h => ({
      value: h.position_id,
      label: h.position_name,
      variant: 'subtle' as const,
   }))
}

export async function searchLocationOptions(
   searchClient: SearchClient,
   query: string,
): Promise<EntityOption[]> {
   const hits = await meiliHits<LocationDocument>(
      searchClient,
      INDEX_NAMES.locations,
      query,
   )
   return hits.map(h => ({
      value: h.location_id,
      label: h.label,
      variant: 'subtle' as const,
   }))
}

/** Parse "City, ST" (or "City, State") into location create payload. */
export function parseLocationLabel(label: string): {
   city: string
   state: string
   state_code: string
} | null {
   const parts = label.split(',').map(s => s.trim()).filter(Boolean)
   if (parts.length < 2) return null
   const city = parts[0]!
   const rest = parts.slice(1).join(', ')
   // Prefer 2–3 letter state code when present
   if (/^[A-Za-z]{2,3}$/.test(rest)) {
      return { city, state: rest.toUpperCase(), state_code: rest.toUpperCase() }
   }
   // "Pennsylvania" style — use abbreviation of first letters if code unknown
   const state_code = rest.length <= 3 ? rest.toUpperCase() : rest.slice(0, 2).toUpperCase()
   return { city, state: rest, state_code }
}
