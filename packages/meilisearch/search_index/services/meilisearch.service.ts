import { MeiliSearch } from 'meilisearch';

if (!process.env.MEILI_HOST) throw new Error('MEILI_HOST is required');
if (!process.env.MEILI_MASTER_KEY)
   throw new Error('MEILI_MASTER_KEY is required');

export const meilisearchService = {
   client: new MeiliSearch({
      host: process.env.MEILI_HOST,
      apiKey: process.env.MEILI_MASTER_KEY
   })
};
