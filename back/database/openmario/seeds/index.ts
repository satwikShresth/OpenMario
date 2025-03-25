import { seedLocation } from "./seed_location.ts";
import { seedComapnyPositions } from "./seed_position_company.ts";
import { seedMajorsMinors } from "./seed_majors_minors.ts";

await seedLocation();
await seedComapnyPositions();
await seedMajorsMinors();
