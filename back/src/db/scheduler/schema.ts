import {
  pgTable,
  varchar,
  text,
  integer,
  time,
  foreignKey,
  serial,
  numeric,
  pgView,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const metadata = pgTable("metadata", {
  key: varchar({ length: 255 }).notNull(),
  value: text(),
});

export const courses = pgTable("courses", {
  crn: integer().notNull(),
  subjectCode: text("subject_code").notNull(),
  courseNumber: text("course_number").notNull(),
  instructionType: text("instruction_type").notNull(),
  instructionMethod: text("instruction_method").notNull(),
  section: text().notNull(),
  enroll: text(),
  maxEnroll: text("max_enroll"),
  courseTitle: text("course_title").notNull(),
  credits: text(),
  prereqs: text(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  days: text().array(),
});

export const courseInstructor = pgTable(
  "course_instructor",
  {
    courseId: integer("course_id").notNull(),
    instructorId: integer("instructor_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.crn],
      name: "course_instructor_course_id_fkey",
    }),
    foreignKey({
      columns: [table.instructorId],
      foreignColumns: [instructors.id],
      name: "course_instructor_instructor_id_fkey",
    }),
  ],
);

export const instructors = pgTable("instructors", {
  id: serial().notNull(),
  name: text().notNull(),
  avgDifficulty: numeric("avg_difficulty"),
  avgRating: numeric("avg_rating"),
  numRatings: integer("num_ratings"),
  rmpId: integer("rmp_id"),
});
export const allCourseInstructorData = pgView("all_course_instructor_data", {
  instructorId: integer("instructor_id"),
  instructorName: text("instructor_name"),
  instructorRmpId: integer("instructor_rmp_id"),
  avgDifficulty: numeric("avg_difficulty"),
  avgRating: numeric("avg_rating"),
  numRatings: integer("num_ratings"),
  courseId: integer("course_id"),
  subjectCode: text("subject_code"),
  courseNumber: text("course_number"),
  instructionType: text("instruction_type"),
  instructionMethod: text("instruction_method"),
  section: text(),
  enroll: text(),
  maxEnroll: text("max_enroll"),
  courseTitle: text("course_title"),
  credits: text(),
  prereqs: text(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  days: text(),
}).as(
  sql`SELECT i.id AS instructor_id, i.name AS instructor_name, i.rmp_id AS instructor_rmp_id, i.avg_difficulty, i.avg_rating, i.num_ratings, c.crn AS course_id, c.subject_code, c.course_number, c.instruction_type, c.instruction_method, c.section, c.enroll, c.max_enroll, c.course_title, c.credits, c.prereqs, c.start_time, c.end_time, c.days FROM courses c LEFT JOIN course_instructor ci ON c.crn = ci.course_id LEFT JOIN instructors i ON i.id = ci.instructor_id`,
);
