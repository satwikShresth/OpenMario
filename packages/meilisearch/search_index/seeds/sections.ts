import type { MeiliSearch } from 'meilisearch';
import { db, meiliSectionsIdx } from '@openmario/db';
import type { SectionDocument } from '@/types';

const BATCH_SIZE = 1000;

export default async function seedSections(
   meilisearch: MeiliSearch,
   indexName: string
): Promise<void> {
   console.log(`[sections] Fetching rows from meili_sections_idx view...`);

   const rows = await db.select().from(meiliSectionsIdx);

   console.log(
      `[sections] Seeding ${rows.length} sections in batches of ${BATCH_SIZE}...`
   );

   const index = meilisearch.index<SectionDocument>(indexName);

   for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await index.addDocuments(batch as any, { primaryKey: 'crn' });
      console.log(
         `[sections] Indexed batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(rows.length / BATCH_SIZE)}`
      );
   }

   console.log(`[sections] Done seeding ${rows.length} sections.`);
}
