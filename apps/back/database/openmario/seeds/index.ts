import { seedLocation } from "./seed_location.ts";
import { seedComapnyPositions } from "./seed_position_company.ts";
import { seedMajorsMinors } from "./seed_majors_minors.ts";
import seedJobPosting from "./seed_job_posting.ts";

// Sequential execution with explicit promise resolution
async function seedJobDatabase() {
  try {
    // // Step 1: Seed locations and wait for complete resolution
    // console.log('Starting location seeding...');
    // await seedLocation();
    // console.log('Location seeding completed.');
    //
    // // Step 2: Only start company positions after locations are fully resolved
    // console.log('Starting company positions seeding...');
    // await seedComapnyPositions();
    // console.log('Company positions seeding completed.');
    //
    // // Step 3: Only start majors/minors after company positions are fully resolved
    // console.log('Starting majors and minors seeding...');
    // await seedMajorsMinors();
    // console.log('Majors and minors seeding completed.');

    // Step 4: Only start job postings after majors/minors are fully resolved
    console.log("Starting job postings seeding...");
    await seedJobPosting();
    console.log("Job postings seeding completed.");

    console.log("All job database seeding completed successfully!");
  } catch (error) {
    console.error("Error during job database seeding:", error);
    process.exit(1);
  }
}

// Execute the seeding process and handle potential errors
seedJobDatabase()
  .then(() => {
    console.log("Job seeding process finished successfully.");
  })
  .catch((error) => {
    console.error("Fatal error in job seeding process:", error);
    process.exit(1);
  });
