import { createMeilisearchService } from '../../src/client';

if (!process.env.MEILI_HOST) throw new Error('MEILI_HOST is required');
if (!process.env.MEILI_MASTER_KEY)
   throw new Error('MEILI_MASTER_KEY is required');

export const meilisearchService = await createMeilisearchService(
   process.env.MEILI_HOST,
   process.env.MEILI_MASTER_KEY
);
