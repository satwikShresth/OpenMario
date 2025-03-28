import { seedLocation } from "./seed_location.ts";
import { seedComapnyPositions } from "./seed_position_company.ts";
import { seedMajorsMinors } from "./seed_majors_minors.ts";
import  seedJobPosting from "./seed_job_posting.ts";
import  seedSearchEngine from "./seed_melisearch.ts";

await seedLocation();
await seedComapnyPositions();
await seedMajorsMinors();
await seedJobPosting().catch(console.error);
await seedSearchEngine().catch(error => {
  console.error("Error:", error);
});

