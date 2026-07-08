import companies from './seeds/companies.ts';
import professors from './seeds/professors.ts';
import sections from './seeds/sections.ts';
import { join } from 'node:path';
import { migrateAndSeed } from './lib/migrate-and-seed.ts';
import { meilisearchService } from './services/meilisearch.service.ts';

const mode = process.argv[2] ?? 'all';
const meilisearch = meilisearchService.client;
const root = import.meta.dir;

const indexes = {
   companies: {
      name: 'companies',
      config: join(root, 'indexes/companies.json'),
      seeder: companies
   },
   professors: {
      name: 'professors',
      config: join(root, 'indexes/instructors.json'),
      seeder: professors
   },
   sections: {
      name: 'sections',
      config: join(root, 'indexes/sections.json'),
      seeder: sections
   }
} as const;

const runs =
   mode === 'courses'
      ? [indexes.professors, indexes.sections]
      : mode === 'all'
        ? Object.values(indexes)
        : [indexes[mode as keyof typeof indexes]].filter(Boolean);

if (runs.length === 0) {
   throw new Error(
      `Unknown seed mode "${mode}". Use: all | courses | companies | professors | sections`
   );
}

for (const { name, config, seeder } of runs) {
   await migrateAndSeed(meilisearch, name, config, seeder, {
      recreate: process.env.MEILI_RECREATE === name
   });
}

console.log(`\nMeilisearch seed complete (${mode}).`);
