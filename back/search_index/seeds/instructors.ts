import { MeiliSearch } from 'meilisearch';
import { db, instructors } from '../../src/db/index.ts';

export default async (meilisearch: MeiliSearch, index: string) => {
   const instructorsToIndex = await db
      .select({
         id: instructors.id,
         name: instructors.name,
         avg_difficulty: instructors.avg_difficulty,
         avg_rating: instructors.avg_rating,
         num_ratings: instructors.num_ratings,
         department: instructors.department,
         rmp_legacy_id: instructors.rmp_legacy_id,
         rmp_id: instructors.rmp_id,
      })
      .from(instructors);

   await meilisearch.index(index).addDocuments(instructorsToIndex);

   console.log(`Indexed ${instructorsToIndex.length} instructors successfully`);
};
