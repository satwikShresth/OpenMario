import type { MeiliSearch } from 'meilisearch'
import { company, position } from '@openmario/db'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { waitForTask } from '../lib/tasks'
import type { PositionDocument } from '@/types'

const BATCH_SIZE = 500

export default async function seedPositions(
   meilisearch: MeiliSearch,
   indexName: string,
): Promise<void> {
   const rows = await db
      .select({
         position_id: position.id,
         position_name: position.name,
         company_id: position.company_id,
         company_name: company.name,
      })
      .from(position)
      .innerJoin(company, eq(position.company_id, company.id))

   console.log(`[positions] Indexing ${rows.length} positions…`)

   const index = meilisearch.index<PositionDocument>(indexName)
   const docs: PositionDocument[] = rows.map(r => ({
      position_id: r.position_id,
      position_name: r.position_name,
      company_id: r.company_id,
      company_name: r.company_name,
   }))

   for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE)
      const task = await index.addDocuments(batch)
      await waitForTask(meilisearch, task.taskUid)
      console.log(
         `[positions] Batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(docs.length / BATCH_SIZE) || 1}`,
      )
   }

   console.log(`[positions] Done (${docs.length} documents).`)
}
