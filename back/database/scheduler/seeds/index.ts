import seedCourses from "./course.ts";
import seedSections from "./sections.ts";
import seedSubjects from "./subjects.ts";
import seedInstructors from "./instructors.ts";
import seed_melisearch from './seed_melisearch.ts';

// Sequential execution with explicit promise resolution
async function seedDatabase() {
  try {
    // Step 1: Seed subjects and wait for complete resolution
    console.log("Starting subjects seeding...");
    await seedSubjects();
    console.log("Subjects seeding completed.");
    
    // Step 2: Only start instructors after subjects are fully resolved
    console.log("Starting instructors seeding...");
    await seedInstructors();
    console.log("Instructors seeding completed.");
    
    // Step 3: Only start courses after instructors are fully resolved
    console.log("Starting courses seeding...");
    await seedCourses();
    console.log("Courses seeding completed.");
    
    // Step 4: Only start sections after courses are fully resolved
    console.log("Starting sections seeding...");
    await seedSections();
    console.log("Sections seeding completed.");
    
    // Step 5: Only start MeiliSearch after sections are fully resolved
    console.log("Starting MeiliSearch seeding...");
    await seed_melisearch();
    console.log("MeiliSearch seeding completed.");
    
    console.log("All database seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
    process.exit(1);
  }
}

seedDatabase()
  .then(() => {
    console.log("Seeding process finished successfully.");
  })
  .catch(error => {
    console.error("Fatal error in seeding process:", error);
    process.exit(1);
  });
