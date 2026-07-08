import type { MeiliSearch } from 'meilisearch';
import { submissionMView } from '@openmario/db';
import type { SubmissionDocument } from '@/types';
import { db } from '../db';
import { waitForTask } from '../lib/tasks';

const BATCH_SIZE = 500;

const toDocument = (row: typeof submissionMView.$inferSelect): SubmissionDocument => ({
   id: row.id,
   year: row.year,
   coop_year: row.coop_year,
   coop_cycle: row.coop_cycle,
   program_level: row.program_level,
   work_hours: row.work_hours,
   compensation: row.compensation,
   other_compensation: row.other_compensation,
   details: row.details,
   company_id: row.company_id,
   company_name: row.company_name,
   position_id: row.position_id,
   position_name: row.position_name,
   city: row.city,
   state: row.state,
   state_code: row.state_code
});

export default async function seedSubmissions(
   meilisearch: MeiliSearch,
   indexName: string
): Promise<void> {
   console.log('[submissions] Refreshing submissions_m_view…');
   await db.refreshMaterializedView(submissionMView);

   const rows = await db.select().from(submissionMView);
   console.log(`[submissions] Indexing ${rows.length} submissions…`);

   const index = meilisearch.index<SubmissionDocument>(indexName);

   for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE).map(toDocument);
      const task = await index.addDocuments(batch);
      await waitForTask(meilisearch, task.taskUid);
      console.log(
         `[submissions] Batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(rows.length / BATCH_SIZE)}`
      );
   }

   console.log(`[submissions] Done (${rows.length} documents).`);
}
