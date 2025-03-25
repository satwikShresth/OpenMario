import sections___ from "./assets/sections.json" with { type: "json" };
import {
  courses,
  instructors,
  section_instructor,
  sections,
} from "../../../src/db/scheduler/schema.ts";
import { db } from "../../../src/db/index.ts";
import { and, eq } from "drizzle-orm";
const days_to_num = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};
async function processSections() {
  const sections_ = [];
  const promises = sections___.map(
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
            term: 202435,
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

export default async () => {
  const sections_ = await processSections();
  sections_.forEach(async ({ instructors: instructorNames, ...insertData }) => {
    const instructor_ids =
      instructorNames?.length > 0
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
        .returning({ section_id: sections.crn });

      if (instructor_ids !== null) {
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
  });
};
