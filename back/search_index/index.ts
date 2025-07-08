import job_posting from './seeds/job_posting.ts';
import courses from './seeds/courses.ts';
import sections from './seeds/sections.ts';
import instructors from './seeds/instructors.ts';
import { meilisearchService } from '#/services/meilisearch.service.ts';
import type { MeiliSearch } from 'meilisearch';

const migrateAndSeed = async (
   meilisearch: MeiliSearch,
   index: string,
   jsonFilePath: string,
   seeder: (meilisearch: MeiliSearch, index: string) => Promise<void>,
) => {
   const { default: { primaryKey, settings } } = await import(
      jsonFilePath,
      {
         with: { type: 'json' },
      }
   );
   await meilisearch.createIndex(index, { primaryKey });
   await meilisearch.index(index).updateSettings(settings);
   await seeder(meilisearch, index);
};

const meilisearch = meilisearchService.client;
await migrateAndSeed(meilisearch, 'courses', './indexes/courses.json', courses);
await migrateAndSeed(meilisearch, 'instructors', './indexes/instructors.json', instructors);
await migrateAndSeed(meilisearch, 'job_postings', './indexes/job_postings.json', job_posting);
await migrateAndSeed(meilisearch, 'sections', './indexes/sections.json', sections);
