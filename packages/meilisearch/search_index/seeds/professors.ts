import type { MeiliSearch } from 'meilisearch';
import { db, meiliProfessorsIdx } from '@openmario/db';
import type { ProfessorDocument } from '@/types';

const BATCH_SIZE = 500;

export default async function seedProfessors(
   meilisearch: MeiliSearch,
   indexName: string
): Promise<void> {
   console.log(`[professors] Fetching rows from meili_professors_idx view...`);
   await db.refreshMaterializedView(meiliProfessorsIdx);

   const rows = await db.select().from(meiliProfessorsIdx);

   console.log(
      `[professors] Seeding ${rows.length} professors in batches of ${BATCH_SIZE}...`
   );

   const index = meilisearch.index<ProfessorDocument>(indexName);

   for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE) as ProfessorDocument[];
      await index.addDocuments(batch, { primaryKey: 'id' });
      console.log(
         `[professors] Indexed batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(rows.length / BATCH_SIZE)}`
      );
   }

   console.log(`[professors] Done seeding ${rows.length} professors.`);
}
