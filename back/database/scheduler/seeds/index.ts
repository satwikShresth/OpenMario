import seedCourses from "./course.ts";
import seedSections from "./sections.ts";
import seedSubjects from "./subjects.ts";
import seedInstructors from "./instructors.ts";

await seedSubjects();
await seedCourses().catch(console.error);
await seedInstructors();
await seedSections();
