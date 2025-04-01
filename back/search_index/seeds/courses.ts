import { MeiliSearch } from 'meilisearch';
import { colleges, courses, db, subjects } from '../../src/db/index.ts';
import { eq, sql } from 'drizzle-orm';

export default async (meilisearch: MeiliSearch, index: string) => {
   const coursesToIndex = await db
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
      .innerJoin(colleges, eq(subjects.college_id, colleges.id));

   await meilisearch.index(index).addDocuments(coursesToIndex);

   console.log(`Indexed ${coursesToIndex.length} courses successfully`);
};
