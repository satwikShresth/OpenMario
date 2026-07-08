import type { MeiliSearch } from 'meilisearch';
import { meiliSectionsIdx } from '@openmario/db';
import { db } from '../db';
import {
   isActiveTerm,
   MEILI_FILTER_ACTIVE_TERMS,
   MEILI_FILTER_RETIRED_2025
} from '../constants';
import { waitForTask } from '../lib/tasks';
import type { SectionDocument } from '@/types';

const BATCH_SIZE = 1000;

function toSectionDocument(
   row: typeof meiliSectionsIdx.$inferSelect
): SectionDocument {
   return {
      id: `${row.term}_${row.crn}`,
      ...row,
      credits: row.credits != null ? Number(row.credits) : null
   };
}

export default async function seedSections(
   meilisearch: MeiliSearch,
   indexName: string
): Promise<void> {
   console.log(`[sections] Refreshing meili_sections_m_idx…`);
   await db.refreshMaterializedView(meiliSectionsIdx);

   const allRows = await db.select().from(meiliSectionsIdx);
   const rows = allRows.filter(row => isActiveTerm(row.term));
   const documents = rows.map(toSectionDocument);

   console.log(
      `[sections] Indexing ${documents.length} active-year sections ` +
         `(skipped ${allRows.length - rows.length} from other years)`
   );

   const index = meilisearch.index<SectionDocument>(indexName);

   for (const filter of [MEILI_FILTER_RETIRED_2025, MEILI_FILTER_ACTIVE_TERMS]) {
      const deleteTask = await index.deleteDocuments({ filter });
      await waitForTask(meilisearch, deleteTask.taskUid);
   }

   for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);
      const task = await index.addDocuments(batch);
      await waitForTask(meilisearch, task.taskUid);
      console.log(
         `[sections] Batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(documents.length / BATCH_SIZE)}`
      );
   }

   console.log(`[sections] Done (${documents.length} documents).`);
}
