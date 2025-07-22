import { MeiliSearch } from 'meilisearch';
import { db, instructors } from '#db';

export default async (meilisearch: MeiliSearch, index: string) => {
   const BATCH_SIZE = 1000;
   let offset = 0;
   let totalIndexed = 0;
   let batchCount = 0;

   while (true) {
      // Fetch data in batches
      const instructorsBatch = await db
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
         .limit(BATCH_SIZE)
         .offset(offset)
         .then((values) =>
            values.map((
               { avg_rating, avg_difficulty, num_ratings, ...rest },
            ) => ({
               ...rest,
               avg_rating,
               avg_difficulty,
               num_ratings,
               weighted_score: avg_difficulty && avg_rating && num_ratings &&
                  ((5 - avg_difficulty + avg_rating) * num_ratings),
            }))
         );

      // If no more records, break the loop
      if (instructorsBatch.length === 0) break;

      // Index the current batch
      await meilisearch.index(index).addDocuments(instructorsBatch);

      totalIndexed += instructorsBatch.length;
      batchCount++;
      offset += BATCH_SIZE;

      console.log(
         `Indexed batch ${batchCount} (${instructorsBatch.length} instructors)`,
      );
   }

   console.log(
      `Completed indexing ${totalIndexed} instructors in ${batchCount} batches`,
   );
};
