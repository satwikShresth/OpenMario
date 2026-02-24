import { createMeilisearchService } from '@openmario/meilisearch';
import { env } from '@env';

export const meilisearchService = await createMeilisearchService(
   env.MEILI_HOST,
   env.MEILI_MASTER_KEY
);
