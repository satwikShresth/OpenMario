import type { MeiliSearch } from 'meilisearch';
import { company, location, position, submission } from '@openmario/db';
import { eq } from 'drizzle-orm';
import type { SubmissionDocument } from '@/types';
import { db } from '../db';
import { waitForTask } from '../lib/tasks';

const BATCH_SIZE = 500;

export default async function seedSubmissions(
   meilisearch: MeiliSearch,
   indexName: string
): Promise<void> {
   console.log('[submissions] Loading submissions from base tables…');

   const rows = await db
      .select({
         id: submission.id,
         year: submission.year,
         coop_year: submission.coop_year,
         coop_cycle: submission.coop_cycle,
         program_level: submission.program_level,
         work_hours: submission.work_hours,
         compensation: submission.compensation,
         other_compensation: submission.other_compensation,
         details: submission.details,
         company_id: company.id,
         company_name: company.name,
         position_id: position.id,
         position_name: position.name,
         city: location.city,
         state: location.state,
         state_code: location.state_code
      })
      .from(submission)
      .leftJoin(position, eq(submission.position_id, position.id))
      .leftJoin(location, eq(submission.location_id, location.id))
      .leftJoin(company, eq(position.company_id, company.id));

   const documents: SubmissionDocument[] = rows.map(row => ({
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
   }));

   console.log(`[submissions] Indexing ${documents.length} submissions…`);

   const index = meilisearch.index<SubmissionDocument>(indexName);

   for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);
      const task = await index.addDocuments(batch);
      await waitForTask(meilisearch, task.taskUid);
      console.log(
         `[submissions] Batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(documents.length / BATCH_SIZE)}`
      );
   }

   console.log(`[submissions] Done (${documents.length} documents).`);
}
