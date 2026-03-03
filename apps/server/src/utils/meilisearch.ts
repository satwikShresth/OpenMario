import { createMeilisearchService } from '@openmario/meilisearch';
import { env } from '@env';

export const meilisearch = await createMeilisearchService(
   env.MEILI_HOST,
   env.MEILI_MASTER_KEY
);
