import type { MeiliSearch } from 'meilisearch';
import { meiliSectionsIdx } from '@openmario/db';
import { db } from '../db';
import { isTerm2025, MEILI_FILTER_TERMS_2025 } from '../constants';
import type { SectionDocument } from '@/types';

const BATCH_SIZE = 1000;

export default async function seedSections(
   meilisearch: MeiliSearch,
   indexName: string
): Promise<void> {
   console.log(`[sections] Fetching rows from meili_sections_idx view...`);
   await db.refreshMaterializedView(meiliSectionsIdx);

   const allRows = await db.select().from(meiliSectionsIdx);
   const rows = allRows.filter(row => !isTerm2025(row.term));

   console.log(
      `[sections] Excluding ${allRows.length - rows.length} sections from 2025 terms`
   );
   console.log(
      `[sections] Seeding ${rows.length} sections in batches of ${BATCH_SIZE}...`
   );

   const index = meilisearch.index<SectionDocument>(indexName);

   console.log(`[sections] Deleting 2025 term documents from index…`);
   const deleteTask = await index.deleteDocuments({
      filter: MEILI_FILTER_TERMS_2025
   });
   await meilisearch.tasks.waitForTask(deleteTask.taskUid);
   console.log(`[sections] Deleted 2025 term documents.`);

   for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await index.addDocuments(batch as any, { primaryKey: 'crn' });
      console.log(
         `[sections] Indexed batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(rows.length / BATCH_SIZE)}`
      );
   }

   console.log(`[sections] Done seeding ${rows.length} sections.`);
}
