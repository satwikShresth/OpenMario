import { db, migrate } from '@/db';
import {
   terms,
   courses,
   sections,
   submissions,
   companyPositions,
   planEvents
} from '@/db/schema';
import { createCollection } from '@tanstack/react-db';
import { drizzleCollectionOptions } from 'tanstack-db-pglite';

// Singleton pattern for migrations - ensures migrate() runs only once
let migrationPromise: Promise<void> | null = null;

const ensureMigrations = (): Promise<void> => {
   if (!migrationPromise) {
      migrationPromise = migrate();
   }
   return migrationPromise;
};

export const termsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: terms,
      primaryColumn: terms.id,
      sync: async () => {
         await ensureMigrations();
         await db
            .insert(terms)
            .values([
               { term: 'Spring', year: 2025, isActive: false },
               { term: 'Summer', year: 2025, isActive: false },
               { term: 'Fall', year: 2025, isActive: false },
               { term: 'Winter', year: 2025, isActive: false }
            ])
            .onConflictDoNothing();
      }
   })
);

export const coursesCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: courses,
      primaryColumn: courses.id,
      sync: async () => await ensureMigrations()
   })
);

export const sectionsCollection = createCollection(
   drizzleCollectionOptions({
      db,

      table: sections,
      primaryColumn: sections.crn,
      sync: async () => await ensureMigrations()
   })
);

export const submissionsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: submissions,
      primaryColumn: submissions.id,
      sync: async () => await ensureMigrations()
   })
);

export const companyPositionsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: companyPositions,
      primaryColumn: companyPositions.id,
      sync: async () => await ensureMigrations()
   })
);

export const planEventsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: planEvents,
      primaryColumn: planEvents.id,
      sync: async () => await ensureMigrations()
   })
);
