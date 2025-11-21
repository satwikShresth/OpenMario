import { db, migrate } from '@/db';
import { favorites, submissions, companyPositions } from '@/db/schema';
import { createCollection } from '@tanstack/react-db';
import { drizzleCollectionOptions } from 'tanstack-db-pglite';

export const favoritesCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: favorites,
      primaryColumn: favorites.id,
      prepare: async () => await migrate(),
      sync: async () => {}
   })
);

export const submissionsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: submissions,
      primaryColumn: submissions.id,
      prepare: async () => await migrate(),
      sync: async () => {}
   })
);

export const companyPositionsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: companyPositions,
      primaryColumn: companyPositions.id,
      prepare: async () => await migrate(),
      sync: async () => {}
   })
);
