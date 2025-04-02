import * as schema from '../../../src/db/scheduler/schema.ts';
import { db } from '../../../src/db/index.ts';
import data from './assets/courses.json' with { type: 'json' };

const seedCourses = async (data) => {
   const courseMap = new Map();

   // Process each subject sequentially
   for (const [subjectCode, subjectData] of Object.entries(data)) {
      if (subjectData.courses && Array.isArray(subjectData.courses)) {
         // Process each course in the subject sequentially
         for (const course of subjectData.courses) {
            // Parse credits - handle ranges
            let numericCredits = 0;
            let creditRange = null;

            if (course.credits) {
               if (course.credits.includes('-')) {
                  creditRange = course.credits;
                  // Use the maximum value for numeric credits
                  const match = course.credits.match(/\d+(\.\d+)?/g);
                  if (match && match.length > 1) {
                     numericCredits = parseFloat(match[1]);
                  }
               } else {
                  numericCredits = parseFloat(course.credits);
               }
            }

            try {
               const [{ courseId }] = await db
                  .insert(schema.courses)
                  .values({
                     subject_id: subjectCode,
                     course_number: course.number,
                     title: course.title,
                     description: course.description || null,
                     credits: numericCredits,
                     credit_range: creditRange,
                     repeat_status: course.repeatStatus || null,
                     prerequisites: course.prerequisites || null,
                     corequisites: course.corequisites || null,
                     restrictions: course.restrictions || null,
                     writing_intensive: course.writingIntensive || false,
                  })
                  .returning({ courseId: schema.courses.id })
                  .onConflictDoNothing();

               if (courseId) {
                  courseMap.set(`${subjectCode}-${course.number}`, courseId);
                  console.log(
                     `Added course: ${subjectCode} ${course.number} - ${course.title}`,
                  );
               } else {
                  console.log(
                     `Course already exists: ${subjectCode} ${course.number} - ${course.title}`,
                  );
               }
            } catch (error) {
               console.error(
                  `Error adding course ${subjectCode} ${course.number}:`,
                  error,
               );
               // Continue with other courses even if one fails
            }
         }
      }
   }
};

try {
   // Wait for all courses to be seeded before returning
   await seedCourses(data);
   console.log('Course seeding completed successfully');
} catch (error) {
   console.error('Error seeding courses:', error);
   throw error; // Re-throw to handle in the main sequence
}
