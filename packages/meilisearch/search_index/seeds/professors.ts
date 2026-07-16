import type { MeiliSearch } from 'meilisearch';
import { meiliProfessorsIdx, isPlaceholderInstructor } from '@openmario/db';
import { db } from '../db';
import { ACTIVE_TERM_NUMBERS } from '../constants';
import { waitForTask } from '../lib/tasks';
import type { ProfessorDocument } from '@/types';

const BATCH_SIZE = 500;

export default async function seedProfessors(
   meilisearch: MeiliSearch,
   indexName: string
): Promise<void> {
   console.log(`[professors] Refreshing meili_professors_m_idx…`);
   await db.refreshMaterializedView(meiliProfessorsIdx);

   const allRows = await db.select().from(meiliProfessorsIdx);
   const rows = allRows.filter(
      row =>
         !isPlaceholderInstructor(row.name) &&
         row.most_recent_term != null &&
         ACTIVE_TERM_NUMBERS.includes(row.most_recent_term)
   ) as ProfessorDocument[];

   console.log(
      `[professors] Indexing ${rows.length} active-year professors ` +
         `(skipped ${allRows.length - rows.length} from prior years)`
   );

   const index = meilisearch.index<ProfessorDocument>(indexName);

   for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const task = await index.addDocuments(batch);
      await waitForTask(meilisearch, task.taskUid);
      console.log(
         `[professors] Batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(rows.length / BATCH_SIZE)}`
      );
   }

   console.log(`[professors] Done (${rows.length} documents).`);
}
