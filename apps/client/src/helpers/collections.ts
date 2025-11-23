import { db } from '@/db';
import {
   favorites,
   submissions,
   companyPositions,
   planEvents,
   coursesTaken
} from '@/db/schema';
import { createCollection, eq, and } from '@tanstack/react-db';
import { drizzleCollectionOptions } from 'tanstack-db-pglite';

export const favoritesCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: favorites,
      primaryColumn: favorites.id,
      sync: async () => {}
   })
);

export const submissionsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: submissions,
      primaryColumn: submissions.id,
      sync: async () => {}
   })
);

export const companyPositionsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: companyPositions,
      primaryColumn: companyPositions.id,
      sync: async () => {}
   })
);

export const planEventsCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: planEvents,
      primaryColumn: planEvents.id,
      sync: async () => {}
   })
);

export const coursesTakenCollection = createCollection(
   drizzleCollectionOptions({
      db,
      table: coursesTaken,
      primaryColumn: coursesTaken.id,
      sync: async () => {}
   })
);

// Helper function to get scheduled courses for a specific term/year
export const getScheduledCoursesQuery = (term: string, year: number) => {
   return (q: any) =>
      q
         .from({ events: planEventsCollection })
         .where(({ events }: any) =>
            and(
               eq(events.type, 'course'),
               eq(events.term, term),
               eq(events.year, year)
            )
         )
         .select(({ events }: any) => ({ ...events }));
};
