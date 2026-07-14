import type { MeiliSearch } from 'meilisearch'
import { location } from '@openmario/db'
import { db } from '../db'
import { waitForTask } from '../lib/tasks'
import type { LocationDocument } from '@/types'

const BATCH_SIZE = 500

export default async function seedLocations(
   meilisearch: MeiliSearch,
   indexName: string,
): Promise<void> {
   const rows = await db.select().from(location)
   console.log(`[locations] Indexing ${rows.length} locations…`)

   const index = meilisearch.index<LocationDocument>(indexName)
   const docs: LocationDocument[] = rows.map(r => ({
      location_id: r.id,
      city: r.city,
      state: r.state,
      state_code: r.state_code,
      label: `${r.city}, ${r.state_code}`,
   }))

   for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE)
      const task = await index.addDocuments(batch)
      await waitForTask(meilisearch, task.taskUid)
      console.log(
         `[locations] Batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(docs.length / BATCH_SIZE) || 1}`,
      )
   }

   console.log(`[locations] Done (${docs.length} documents).`)
}
