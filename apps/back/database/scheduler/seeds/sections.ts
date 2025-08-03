// import sections_202435 from "./assets/sections_202435.json" with { type: "json" };
// import sections_202445 from "./assets/sections_202445.json" with { type: "json" };
import sections_202515 from './assets/sections_202515.json' with { type: 'json' };
import sections_202525 from './assets/sections_202525.json' with { type: 'json' };
import sections_202535 from './assets/sections_202535.json' with { type: 'json' };
import sections_202545 from './assets/sections_202545.json' with { type: 'json' };
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

// Valid enum values from your schema
const VALID_INSTRUCTION_TYPES = [
   'instruction',
   'Career Integrated Experience',
   'Clinical',
   'Dissertation',
   'Integrated Lecture & Lab',
   'Internship/Clerkship/Preceptor',
   'Lab',
   'Lab & Studio',
   'Lecture',
   'Lecture & Clinical',
   'Lecture & Lab',
   'Lecture, Lab & Studio',
   'Lecture & Practicum',
   'Lecture & Recitation',
   'Lecture & Seminar',
   'Lecture & Studio',
   'Medical Rotation',
   'Performance',
   'Practice',
   'Practicum',
   'Practicum & Clinical',
   'Private Lesson',
   'Recitation/Discussion',
   'Recitation & Lab',
   'Research',
   'Seminar',
   'Seminar & Clinical',
   'Seminar & Research',
   'Special Topics',
   'Special Topics-Lab',
   'Special Topics-Lecture',
   'Special Topics-Lecture & Lab',
   'Special Topics-Seminar',
   'Studio',
   'Study Abroad',
   'Thesis',
];

const VALID_INSTRUCTION_METHODS = [
   'instruction',
   'Community Based Learning',
   'Face To Face',
   'Hybrid',
   'Online-Asynchronous',
   'Online-Synchronous',
   'Remote Asynchronous',
   'Remote Synchronous',
];

// Helper function to normalize enum values
function normalizeInstructionType(type: string): string | null {
   if (!type) return 'instruction'; // Default to 'instruction'

   // Direct match
   if (VALID_INSTRUCTION_TYPES.includes(type)) {
      return type;
   }

   // Map common variations
   const typeMap = {
      'Practicum & Seminar': 'Lecture & Seminar', // This maps your failing case
      Lab: 'Lab',
      Lec: 'Lecture',
      Sem: 'Seminar',
      Studio: 'Studio',
      Recitation: 'Recitation/Discussion',
      Workshop: 'Special Topics',
      'Independent Study': 'Research',
      Internship: 'Internship/Clerkship/Preceptor',
      Clinical: 'Clinical',
      'Field Experience': 'Career Integrated Experience',
      Thesis: 'Thesis',
      Dissertation: 'Dissertation',
   };

   if (typeMap[type]) {
      return typeMap[type];
   }

   // Try partial matches
   const lowerType = type.toLowerCase();
   for (const validType of VALID_INSTRUCTION_TYPES) {
      if (
         lowerType.includes(validType.toLowerCase()) ||
         validType.toLowerCase().includes(lowerType)
      ) {
         return validType;
      }
   }

   console.warn(
      `Unknown instruction_type: ${type}, defaulting to 'instruction'`,
   );
   return 'instruction'; // Default fallback
}

function normalizeInstructionMethod(method: string): string | null {
   if (!method) return 'instruction'; // Default to 'instruction'

   // Direct match
   if (VALID_INSTRUCTION_METHODS.includes(method)) {
      return method;
   }

   // Map common variations
   const methodMap = {
      Online: 'Online-Asynchronous',
      Remote: 'Remote Asynchronous',
      'Face-to-Face': 'Face To Face',
      F2F: 'Face To Face',
      'In-Person': 'Face To Face',
      Distance: 'Online-Asynchronous',
      Virtual: 'Online-Synchronous',
      Synchronous: 'Online-Synchronous',
      Asynchronous: 'Online-Asynchronous',
   };

   if (methodMap[method]) {
      return methodMap[method];
   }

   console.warn(
      `Unknown instruction_method: ${method}, defaulting to 'instruction'`,
   );
   return 'instruction'; // Default fallback
}

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
               // Normalize enum values before inserting
               const normalizedInstructionType = normalizeInstructionType(instruction_type);
               const normalizedInstructionMethod = normalizeInstructionMethod(instruction_method);

               sections_.push({
                  crn,
                  course_id: result.id,
                  section,
                  credits: (credits && parseFloat(credits)) || null,
                  days: days?.map((day) => days_to_num[day]) ?? null,
                  start_time,
                  end_time,
                  term,
                  instruction_method: normalizedInstructionMethod,
                  instruction_type: normalizedInstructionType,
                  instructors: instructors_?.map(({ name }) => name),
               });
            } else {
               //console.log(
               //  `graduate course skipped ${subject_code} ${course_number}`,
               //);
            }
         } catch (error) {
            console.error(`Error processing section ${crn}:`, error);
         }
      },
   );
   await Promise.all(promises);
   return sections_;
}

// Helper function to get or create instructor using insert + lookup pattern
async function getOrCreateInstructor(name: string): Promise<number | null> {
   try {
      // Skip empty or invalid names
      if (!name || typeof name !== 'string' || name.trim() === '') {
         console.warn(`Skipping invalid instructor name: ${name}`);
         return null;
      }

      const trimmedName = name.trim();

      // Try to insert first
      const insertResult = await db
         .insert(instructors)
         .values({ name: trimmedName })
         .onConflictDoNothing()
         .returning({ id: instructors.id });

      if (insertResult.length > 0) {
         // Successfully created new instructor
         return insertResult[0].id;
      }

      // If insert returned nothing (instructor already exists), find the existing one
      const existingInstructor = await db
         .select({ id: instructors.id })
         .from(instructors)
         .where(eq(instructors.name, trimmedName));

      if (existingInstructor.length > 0) {
         return existingInstructor[0].id;
      }

      console.warn(`Could not create or find instructor: ${trimmedName}`);
      return null;
   } catch (error) {
      console.error(`Error upserting instructor ${name}:`, error);
      return null;
   }
}

export const section_function = async (drexel_section, term) => {
   console.log(
      `Starting to process ${drexel_section.length} sections for term ${term}`,
   );

   try {
      const sections_ = await processSections(drexel_section, term);
      console.log(
         `Processed ${sections_.length} valid sections for term ${term}`,
      );

      let processed = 0;
      const batchSize = 50; // Back to larger batches since we fixed the race condition

      for (let i = 0; i < sections_.length; i += batchSize) {
         const batch = sections_.slice(i, i + batchSize);
         console.log(
            `Processing batch ${Math.floor(i / batchSize) + 1}/${
               Math.ceil(sections_.length / batchSize)
            } for term ${term}`,
         );

         await Promise.all(
            batch.map(async ({ instructors: instructorNames, ...insertData }) => {
               try {
                  let instructor_ids = null;

                  // Handle instructor creation/lookup
                  if (instructorNames?.length > 0) {
                     const validInstructorNames = instructorNames.filter(
                        (name) => name && typeof name === 'string' && name.trim() !== '',
                     );

                     if (validInstructorNames.length > 0) {
                        const instructorPromises = validInstructorNames.map((name) =>
                           getOrCreateInstructor(name)
                        );
                        const instructorResults = await Promise.all(instructorPromises);
                        instructor_ids = instructorResults.filter((id) => id !== null);
                     }
                  }

                  // Insert section
                  const insertResult = await db
                     .insert(sections)
                     .values(insertData)
                     .onConflictDoNothing()
                     .returning({ section_id: sections.crn });

                  const section_id = insertResult?.[0]?.section_id || null;

                  // Insert instructor relationships if we have both section and instructors
                  if (section_id && instructor_ids && instructor_ids.length > 0) {
                     await db
                        .insert(section_instructor)
                        .values(
                           instructor_ids.map((instructor_id) => ({
                              instructor_id,
                              section_id,
                           })),
                        )
                        .onConflictDoNothing(); // Prevent duplicate key errors
                  }

                  processed++;
               } catch (error) {
                  console.error(`Error processing section ${insertData.crn}:`, error);
                  // Continue processing other sections even if one fails
               }
            }),
         );
      }

      console.log(`Successfully seeded ${processed} sections for term ${term}`);
   } catch (error) {
      console.error(`Error in section_function for term ${term}:`, error);
      throw error; // Re-throw to handle at the top level
   }
};

// Execute the seeding with proper error handling
async function runSeeding() {
   try {
      console.log('Starting section seeding process...');

      // await section_function(sections_202435, 202435);
      // await section_function(sections_202445, 202445);

      await section_function(sections_202515, 202515);
      await section_function(sections_202525, 202525);
      // await section_function(sections_202535, 202535);
      // await section_function(sections_202545, 202545);

      console.log('All sections seeded successfully!');
   } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
   }
}

// Run the seeding
runSeeding();
