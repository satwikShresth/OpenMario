import { relations } from "drizzle-orm/relations";
import { courseInstructor, courses, instructors } from "./schema";

export const courseInstructorRelations = relations(
  courseInstructor,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseInstructor.courseId],
      references: [courses.crn],
    }),
    instructor: one(instructors, {
      fields: [courseInstructor.instructorId],
      references: [instructors.id],
    }),
  }),
);

export const coursesRelations = relations(courses, ({ many }) => ({
  courseInstructors: many(courseInstructor),
}));

export const instructorsRelations = relations(instructors, ({ many }) => ({
  courseInstructors: many(courseInstructor),
}));
