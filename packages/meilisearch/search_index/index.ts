import companies from './seeds/companies.ts'
import professors from './seeds/professors.ts'
import sections from './seeds/sections.ts'
import submissions from './seeds/submissions.ts'
import courses from './seeds/courses.ts'
import positions from './seeds/positions.ts'
import locations from './seeds/locations.ts'
import { join } from 'node:path'
import { migrateAndSeed } from './lib/migrate-and-seed.ts'
import { meilisearchService } from './services/meilisearch.service.ts'

const mode = process.argv[2] ?? 'all'
const meilisearch = meilisearchService.client
const root = import.meta.dir

const indexes = {
   companies: {
      name: 'companies',
      config: join(root, 'indexes/companies.json'),
      seeder: companies,
   },
   professors: {
      name: 'professors',
      config: join(root, 'indexes/instructors.json'),
      seeder: professors,
   },
   sections: {
      name: 'sections',
      config: join(root, 'indexes/sections.json'),
      seeder: sections,
   },
   courses: {
      name: 'courses',
      config: join(root, 'indexes/courses.json'),
      seeder: courses,
   },
   submissions: {
      name: 'submissions',
      config: join(root, 'indexes/submissions.json'),
      seeder: submissions,
   },
   positions: {
      name: 'positions',
      config: join(root, 'indexes/positions.json'),
      seeder: positions,
   },
   locations: {
      name: 'locations',
      config: join(root, 'indexes/locations.json'),
      seeder: locations,
   },
} as const

/** Legacy alias: professors + sections (pre-catalog courses index). */
const runs =
   mode === 'legacy-courses'
      ? [indexes.professors, indexes.sections]
      : mode === 'all'
        ? Object.values(indexes)
        : [indexes[mode as keyof typeof indexes]].filter(Boolean)

if (runs.length === 0) {
   throw new Error(
      `Unknown seed mode "${mode}". Use: all | courses | legacy-courses | companies | professors | sections | submissions | positions | locations`,
   )
}

for (const { name, config, seeder } of runs) {
   await migrateAndSeed(meilisearch, name, config, seeder, {
      recreate: process.env.MEILI_RECREATE === name,
   })
}

console.log(`\nMeilisearch seed complete (${mode}).`)
