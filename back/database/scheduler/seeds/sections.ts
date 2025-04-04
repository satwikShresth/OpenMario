import sections_202435 from './assets/sections_202435.json' with { type: 'json' };
import sections_202445 from './assets/sections_202445.json' with { type: 'json' };
import {
   courses,
   instructors,
   section_instructor,
   sections,
} from '../../../src/db/scheduler/schema.ts';
import { db } from '../../../src/db/index.ts';
import { and, eq } from 'drizzle-orm';

const days_to_num = {
   Monday: 1,
   Tuesday: 2,
   Wednesday: 3,
   Thursday: 4,
   Friday: 5,
   Saturday: 6,
   Sunday: 7,
};

async function processSections(drexel_section: any, term: number) {
   const sections_ = [];
   const promises = drexel_section.map(
      async ({
         subject_code,
         course_number,
         section,
         credits,
         instruction_method,
         instruction_type,
         days,
         start_time,
         end_time,
         crn,
         instructors: instructors_,
      }) => {
         try {
            const [result] = await db
               .select({ id: courses.id })
               .from(courses)
               .where(
                  and(
                     eq(courses.course_number, course_number),
                     eq(courses.subject_id, subject_code),
                  ),
               );
            if (result) {
               sections_.push({
                  crn,
                  course_id: result.id,
                  section,
                  credits: (credits && parseFloat(credits)) || null,
                  days: days?.map((day) => days_to_num[day]) ?? null,
                  start_time,
                  end_time,
                  term,
                  instruction_method,
                  instruction_type,
                  instructors: instructors_?.map(({ name }) => name),
               });
            } else {
               //console.log(
               //  `graduate course skipped ${subject_code} ${course_number}`,
               //);
            }
         } catch (error) {
            console.error(error);
         }
      },
   );
   await Promise.all(promises);
   return sections_;
}

export const section_function = async (drexel_section, term) => {
   const sections_ = await processSections(drexel_section, term);

   await Promise.all(
      sections_.map(async ({ instructors: instructorNames, ...insertData }) => {
         const instructor_ids = instructorNames?.length > 0
            ? await Promise.all(
               instructorNames.map(
                  async (name) =>
                     await db
                        .select({ id: instructors.id })
                        .from(instructors)
                        .where(eq(instructors.name, name))
                        .then(([{ id }]) => id),
               ),
            )
            : null;
         try {
            const [{ section_id }] = await db
               .insert(sections)
               .values(insertData)
               .onConflictDoNothing()
               .returning({ section_id: sections.crn }) || [{ section_id: null }];
            if (section_id && instructor_ids !== null) {
               await db.insert(section_instructor).values(
                  instructor_ids.map((instructor_id) => ({
                     instructor_id,
                     section_id,
                  })),
               );
            }
         } catch (error) {
            console.log(error);
            console.log(`Issue with`);
            console.log(insertData);
         }
      }),
   );

   console.log(`Seeded ${sections_.length} sections successfully`);
};

await section_function(sections_202435, 202435);
await section_function(sections_202445, 202445);
