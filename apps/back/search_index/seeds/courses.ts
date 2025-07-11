import { MeiliSearch } from "meilisearch";
import { colleges, courses, db, subjects } from "#db";
import { eq, sql } from "drizzle-orm";

export default async (meilisearch: MeiliSearch, index: string) => {
  const BATCH_SIZE = 1000;
  let offset = 0;
  let totalIndexed = 0;
  let batchCount = 0;

  while (true) {
    // Fetch data in batches
    const courseBatch = await db
      .select({
        id: courses.id,
        subject_id: courses.subject_id,
        course_number: courses.course_number,
        title: courses.title,
        description: courses.description,
        credits: courses.credits,
        course: sql`CONCAT(${subjects.id}, ' ', ${courses.course_number})`,
        credit_range: courses.credit_range,
        repeat_status: courses.repeat_status,
        prerequisites: courses.prerequisites,
        corequisites: courses.corequisites,
        restrictions: courses.restrictions,
        writing_intensive: courses.writing_intensive,
        subject_name: subjects.name,
        college_id: colleges.id,
        college_name: colleges.name,
      })
      .from(courses)
      .innerJoin(subjects, eq(courses.subject_id, subjects.id))
      .innerJoin(colleges, eq(subjects.college_id, colleges.id))
      .limit(BATCH_SIZE)
      .offset(offset);

    // If no more records, break the loop
    if (courseBatch.length === 0) break;

    // Index the current batch
    await meilisearch.index(index).addDocuments(courseBatch);

    totalIndexed += courseBatch.length;
    batchCount++;
    offset += BATCH_SIZE;

    console.log(
      `Indexed batch ${batchCount} (${courseBatch.length} courses)`,
    );
  }

  console.log(
    `Completed indexing ${totalIndexed} courses in ${batchCount} batches`,
  );
};
