import type { SubmissionRecord } from '@/db/dexie'
import type { SalaryOffer } from './types'

/** Map a share-link offer into a local draft row (IDs resolved later in the form via Meili). */
export function salaryOfferToDraft(offer: SalaryOffer, id = crypto.randomUUID()): SubmissionRecord {
   return {
      id,
      server_id: null,
      owner_id: null,
      status: 'draft',
      is_draft: true,
      company: offer.company,
      company_id: null,
      position: offer.position,
      position_id: null,
      location: offer.location,
      location_city: null,
      location_state: null,
      location_state_code: null,
      year: offer.year,
      coop_year: offer.coop_year,
      coop_cycle: offer.coop_cycle,
      program_level: offer.program_level,
      work_hours: offer.work_hours,
      compensation: offer.compensation,
      other_compensation: offer.other_compensation || null,
      details: offer.details || null,
      synced_at: null,
   }
}
