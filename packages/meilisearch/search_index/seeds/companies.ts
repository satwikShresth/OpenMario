import type { MeiliSearch } from 'meilisearch';
import { meiliCompaniesIdx } from '@openmario/db';
import { db } from '../db';
import { waitForTask } from '../lib/tasks';
import type { CompanyDocument } from '@/types';

const BATCH_SIZE = 500;

export default async function seedCompanies(
   meilisearch: MeiliSearch,
   indexName: string
): Promise<void> {
   console.log(`[companies] Refreshing meili_companies_m_idx…`);
   await db.refreshMaterializedView(meiliCompaniesIdx);

   const rows = await db.select().from(meiliCompaniesIdx);
   console.log(`[companies] Indexing ${rows.length} companies…`);

   const index = meilisearch.index<CompanyDocument>(indexName);

   for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE) as CompanyDocument[];
      const task = await index.addDocuments(batch);
      await waitForTask(meilisearch, task.taskUid);
      console.log(
         `[companies] Batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(rows.length / BATCH_SIZE)}`
      );
   }

   console.log(`[companies] Done (${rows.length} documents).`);
}
