import type { MeiliSearch } from 'meilisearch';
import { waitForTask } from './tasks';

type IndexConfig = {
   primaryKey: string;
   settings: Record<string, unknown>;
};

export async function migrateAndSeed(
   meilisearch: MeiliSearch,
   index: string,
   configPath: string,
   seeder: (meilisearch: MeiliSearch, index: string) => Promise<void>,
   options?: { recreate?: boolean }
) {
   const { default: config } = (await import(configPath, {
      with: { type: 'json' }
   })) as { default: IndexConfig };

   if (options?.recreate) {
      console.log(`[${index}] Recreating index (primary key: ${config.primaryKey})…`);
      try {
         const deleteTask = await meilisearch.deleteIndex(index);
         await waitForTask(meilisearch, deleteTask.taskUid);
      } catch {
         // index may not exist yet
      }
   }

   const createTask = await meilisearch.createIndex(index, {
      primaryKey: config.primaryKey
   });
   await waitForTask(meilisearch, createTask.taskUid, {
      ignoreAlreadyExists: !options?.recreate
   });

   await seeder(meilisearch, index);

   const settingsTask = await meilisearch.index(index).updateSettings(config.settings);
   await waitForTask(meilisearch, settingsTask.taskUid, { timeOutMs: 120_000 });
}
