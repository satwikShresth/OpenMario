import type { MeiliSearch } from 'meilisearch';
import { db, meiliCompaniesIdx } from '@openmario/db';
import type { CompanyDocument } from '@/types';

const BATCH_SIZE = 500;

export default async function seedCompanies(
   meilisearch: MeiliSearch,
   indexName: string
): Promise<void> {
   console.log(`[companies] Fetching rows from meili_companies_idx view...`);

   const rows = await db.select().from(meiliCompaniesIdx);

   console.log(
      `[companies] Seeding ${rows.length} companies in batches of ${BATCH_SIZE}...`
   );

   const index = meilisearch.index<CompanyDocument>(indexName);

   for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE) as CompanyDocument[];
      await index.addDocuments(batch, { primaryKey: 'company_id' });
      console.log(
         `[companies] Indexed batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(rows.length / BATCH_SIZE)}`
      );
   }

   console.log(`[companies] Done seeding ${rows.length} companies.`);
}
