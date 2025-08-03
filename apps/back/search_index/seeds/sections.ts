import { MeiliSearch } from 'meilisearch';
import { colleges, courses, db, instructors, section_instructor, sections, subjects } from '#db';
import { eq, sql } from 'drizzle-orm';

export default async (meilisearch: MeiliSearch, index: string) => {
   const BATCH_SIZE = 500;
   let offset = 0;
   let totalIndexed = 0;
   let batchCount = 0;

   const daysOfWeekMap = new Map([
      [1, 'Monday'],
      [2, 'Tuesday'],
      [3, 'Wednesday'],
      [4, 'Thursday'],
      [5, 'Friday'],
      [6, 'Saturday'],
      [7, 'Sunday'],
   ]);

   const seasons = {
      '1': 'Fall',
      '2': 'Winter',
      '3': 'Spring',
      '4': 'Summer',
   };

   const parseTerm = (input: string | number | null) =>
      String(input)
         ?.match(/^(\d{4})(\d)(\d)$/)
         ?.filter((_, index) => index > 0)
         ?.map((value, index) => {
            if (index === 0) return value;
            if (index === 1) return seasons[value as string] || 'Unknown';
            if (index === 2) return `UG`;
            return '';
         })
         .reverse()
         .join(' ');

   while (true) {
      // Fetch sections in batches
      const sectionsBatch = await db
         .select({
            crn: sections.crn,
            section: sections.section,
            instruction_type: sections.instruction_type,
            instruction_method: sections.instruction_method,
            credits: sections.credits,
            start_time: sections.start_time,
            end_time: sections.end_time,
            days: sections.days,
            term: sections.term,
            course_id: courses.id,
            course_number: courses.course_number,
            course: sql`CONCAT(${subjects.id}, ' ', ${courses.course_number})`,
            title: courses.title,
            description: courses.description,
            subject_id: subjects.id,
            subject_name: subjects.name,
            college_id: colleges.id,
            college_name: colleges.name,
            instructors: sql`(
            WITH instructor_data AS (
               SELECT
                  ${instructors.id} as id,
                  ${instructors.name} as name,
                  ${instructors.avg_difficulty} as avg_difficulty,
                  ${instructors.avg_rating} as avg_rating,
                  ${instructors.department} as department,
                  ${instructors.rmp_legacy_id} as rmp_id,
                  ${instructors.num_ratings} as num_ratings,
                  CASE
                     WHEN ${instructors.avg_difficulty} IS NOT NULL
                        AND ${instructors.avg_rating} IS NOT NULL 
                        AND ${instructors.num_ratings} IS NOT NULL 
                        THEN ((5 - ${instructors.avg_difficulty} + ${instructors.avg_rating}) * ${instructors.num_ratings})
                     ELSE NULL
                  END as weighted_score
               FROM ${section_instructor}
               JOIN ${instructors} ON ${section_instructor.instructor_id} = ${instructors.id}
               WHERE ${section_instructor.section_id} = ${sections.crn}
            )
            SELECT CASE 
               WHEN COUNT(*) > 0 THEN jsonb_agg(to_jsonb(instructor_data))
               ELSE '[]'::jsonb
            END
            FROM instructor_data
            )`,
         })
         .from(sections)
         .innerJoin(courses, eq(sections.course_id, courses.id))
         .innerJoin(subjects, eq(courses.subject_id, subjects.id))
         .innerJoin(colleges, eq(subjects.college_id, colleges.id))
         .limit(BATCH_SIZE)
         .offset(offset)
         .then((values) =>
            values.map(({ days, term, ...others }) => ({
               term: parseTerm(term),
               days: days?.map((i) => daysOfWeekMap.get(i)) || null,
               ...others,
            }))
         );

      // If no more records, break the loop
      if (sectionsBatch.length === 0) break;

      // Index the current batch
      await meilisearch.index(index).addDocuments(sectionsBatch);

      totalIndexed += sectionsBatch.length;
      batchCount++;
      offset += BATCH_SIZE;

      console.log(
         `Indexed batch ${batchCount} (${sectionsBatch.length} sections)`,
      );
   }

   console.log(
      `Completed indexing ${totalIndexed} sections in ${batchCount} batches`,
   );
};
