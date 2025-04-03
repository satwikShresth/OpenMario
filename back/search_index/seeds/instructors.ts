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
      .from(instructors)
      .then((values) =>
         values.map(({ avg_rating, avg_difficulty, num_ratings, ...rest }) => ({
            ...rest,
            avg_rating,
            avg_difficulty,
            num_ratings,
            weighted_score: avg_difficulty && avg_rating && num_ratings &&
               ((5 - avg_difficulty + avg_rating) * num_ratings),
         }))
      );

   await meilisearch.index(index).addDocuments(instructorsToIndex);

   console.log(`Indexed ${instructorsToIndex.length} instructors successfully`);
};
