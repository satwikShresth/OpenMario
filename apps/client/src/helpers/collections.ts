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

export const termsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: terms,
      primaryColumn: terms.id,
      sync: async () => {
         await migrate();
      }
   })
);

export const coursesCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: courses,
      primaryColumn: courses.id,
      sync: async () => await migrate()
   })
);

export const sectionsCollection = createCollection(
   drizzleCollectionOptions({
      db,

      table: sections,
      primaryColumn: sections.crn,
      sync: async () => await migrate()
   })
);

export const submissionsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: submissions,
      primaryColumn: submissions.id,
      sync: async () => await migrate()
   })
);

export const companyPositionsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: companyPositions,
      primaryColumn: companyPositions.id,
      sync: async () => await migrate()
   })
);

export const planEventsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: planEvents,
      primaryColumn: planEvents.id,
      sync: async () => await migrate()
   })
);
