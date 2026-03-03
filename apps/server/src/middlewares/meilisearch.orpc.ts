import { os } from '@orpc/server';
import { meilisearch } from '@/utils/meilisearch';

export const meilisearchProvider = os.middleware(({ context, next }) => {
   return next({
      //@ts-expect-error: this is expected
      context: { ...context, meilisearch: context.meilisearch ?? meilisearch }
   });
});
