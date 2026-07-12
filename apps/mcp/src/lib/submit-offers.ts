import { and, eq } from 'drizzle-orm';
import {
   company,
   position,
   location,
   submission,
   submissionMView,
   type DbClient
} from '@openmario/db';
import { INDEX_NAMES, type SubmissionDocument } from '@openmario/meilisearch';
import type { MeiliSearch } from 'meilisearch';
import type { ParsedOffer } from './offers-parser';

async function ensureCompany(db: DbClient, name: string): Promise<string> {
   const [existing] = await db
      .select({ id: company.id })
      .from(company)
      .where(eq(company.name, name))
      .limit(1);
   if (existing) return existing.id;

   const [created] = await db
      .insert(company)
      .values({ name, owner_id: null })
      .returning({ id: company.id });
   return created!.id;
}

async function ensurePosition(
   db: DbClient,
   companyId: string,
   name: string
): Promise<string> {
   const [existing] = await db
      .select({ id: position.id })
      .from(position)
      .where(and(eq(position.company_id, companyId), eq(position.name, name)))
      .limit(1);
   if (existing) return existing.id;

   const [created] = await db
      .insert(position)
      .values({ name, company_id: companyId, owner_id: null })
      .returning({ id: position.id });
   return created!.id;
}

function parseLocation(locationStr: string): {
   city: string;
   state_code: string;
} | null {
   const parts = locationStr.split(',').map(s => s.trim());
   if (parts.length < 2 || !parts[0] || !parts[1]) return null;
   // "City, ST" or "City, State"
   const statePart = parts[1]!;
   const state_code =
      statePart.length <= 3
         ? statePart.toUpperCase()
         : statePart.slice(0, 2).toUpperCase();
   return { city: parts[0], state_code };
}

async function ensureLocation(
   db: DbClient,
   locationStr: string
): Promise<string | null> {
   const parsed = parseLocation(locationStr);
   if (!parsed) return null;

   const [existing] = await db
      .select({ id: location.id })
      .from(location)
      .where(
         and(
            eq(location.city, parsed.city),
            eq(location.state_code, parsed.state_code)
         )
      )
      .limit(1);
   if (existing) return existing.id;

   const [created] = await db
      .insert(location)
      .values({
         city: parsed.city,
         state_code: parsed.state_code,
         state: parsed.state_code
      })
      .onConflictDoNothing()
      .returning({ id: location.id });

   if (created) return created.id;

   const [again] = await db
      .select({ id: location.id })
      .from(location)
      .where(
         and(
            eq(location.city, parsed.city),
            eq(location.state_code, parsed.state_code)
         )
      )
      .limit(1);
   return again?.id ?? null;
}

async function syncSubmissionToMeili(
   db: DbClient,
   meili: MeiliSearch,
   submissionId: string
) {
   const [row] = await db
      .select()
      .from(submissionMView)
      .where(eq(submissionMView.id, submissionId))
      .limit(1);
   if (!row) return;

   const asNullableString = (value: unknown): string | null =>
      value == null ? null : String(value);

   const doc: SubmissionDocument = {
      id: row.id,
      year: row.year,
      coop_year: row.coop_year,
      coop_cycle: row.coop_cycle,
      program_level: row.program_level,
      work_hours: row.work_hours ?? 40,
      compensation: row.compensation ?? 0,
      other_compensation: row.other_compensation,
      details: row.details,
      company_id: asNullableString(row.company_id),
      company_name: asNullableString(row.company_name),
      position_id: asNullableString(row.position_id),
      position_name: asNullableString(row.position_name),
      city: asNullableString(row.city),
      state: asNullableString(row.state),
      state_code: asNullableString(row.state_code)
   };

   await meili.index(INDEX_NAMES.submissions).addDocuments([doc]);
}

export type SubmitResult = {
   company: string;
   position: string;
   id?: string;
   error?: string;
};

export async function submitParsedOffers(
   db: DbClient,
   meili: MeiliSearch,
   offers: ParsedOffer[],
   indices?: number[]
): Promise<SubmitResult[]> {
   const selected =
      indices && indices.length > 0
         ? indices.map(i => offers[i]).filter(Boolean)
         : offers;

   const results: SubmitResult[] = [];

   for (const offer of selected as ParsedOffer[]) {
      try {
         if (!offer.company || !offer.position) {
            results.push({
               company: offer.company,
               position: offer.position,
               error: 'Missing company or position'
            });
            continue;
         }

         const companyId = await ensureCompany(db, offer.company);
         const positionId = await ensurePosition(db, companyId, offer.position);
         const locationId = await ensureLocation(
            db,
            offer.location || 'Philadelphia, PA'
         );

         if (!locationId) {
            results.push({
               company: offer.company,
               position: offer.position,
               error: `Could not resolve location: ${offer.location}`
            });
            continue;
         }

         const details = [
            `Employer ID: ${offer.employer_id || 'N/A'}`,
            `Position ID: ${offer.position_id || 'N/A'}`,
            `Job Length: ${offer.job_length || 'N/A'}`,
            `Coop Round: ${offer.coop_round}`,
            `Status: ${offer.status || offer.ranking_status || 'N/A'}`
         ]
            .join(', ')
            .slice(0, 255);

         const [created] = await db
            .insert(submission)
            .values({
               position_id: positionId,
               location_id: locationId,
               coop_cycle: offer.coop_cycle,
               coop_year: offer.coop_year,
               year: offer.year,
               program_level: offer.program_level,
               work_hours: offer.work_hours || 40,
               compensation: offer.compensation || 0,
               other_compensation: (offer.other_compensation || '').slice(
                  0,
                  255
               ),
               details,
               owner_id: null
            })
            .returning({ id: submission.id });

         await db.refreshMaterializedView(submissionMView).concurrently();
         await syncSubmissionToMeili(db, meili, created!.id);

         results.push({
            company: offer.company,
            position: offer.position,
            id: created!.id
         });
      } catch (error) {
         results.push({
            company: offer.company,
            position: offer.position,
            error: error instanceof Error ? error.message : String(error)
         });
      }
   }

   return results;
}
