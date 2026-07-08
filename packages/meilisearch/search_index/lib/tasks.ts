import type { MeiliSearch } from 'meilisearch';

export async function waitForTask(
   meilisearch: MeiliSearch,
   taskUid: number,
   options?: { ignoreAlreadyExists?: boolean; timeOutMs?: number }
) {
   const task = await meilisearch.tasks.waitForTask(taskUid, {
      timeOutMs: options?.timeOutMs ?? 60_000
   });
   if (task.status === 'failed') {
      const message = task.error?.message ?? 'unknown error';
      if (options?.ignoreAlreadyExists && message.includes('already exists')) {
         return;
      }
      throw new Error(`Meilisearch task ${taskUid} failed: ${message}`);
   }
}
