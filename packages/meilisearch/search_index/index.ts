import companies from './seeds/companies.ts';
import professors from './seeds/professors.ts';
import sections from './seeds/sections.ts';
import { meilisearchService } from './services/meilisearch.service.ts';
import type { MeiliSearch } from 'meilisearch';

const migrateAndSeed = async (
   meilisearch: MeiliSearch,
   index: string,
   jsonFilePath: string,
   seeder: (meilisearch: MeiliSearch, index: string) => Promise<void>
) => {
   const {
      default: { primaryKey, settings }
   } = await import(jsonFilePath, {
      with: { type: 'json' }
   });
   await meilisearch.createIndex(index, { primaryKey });
   await seeder(meilisearch, index);
   await meilisearch.index(index).updateSettings(settings);
};

const meilisearch = meilisearchService.client;

await migrateAndSeed(
   meilisearch,
   'companies',
   './indexes/companies.json',
   companies
);

await migrateAndSeed(
   meilisearch,
   'professors',
   './indexes/instructors.json',
   professors
);

await migrateAndSeed(
   meilisearch,
   'sections',
   './indexes/sections.json',
   sections
);
