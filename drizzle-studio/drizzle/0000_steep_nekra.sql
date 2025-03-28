-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "metadata" (
	"key" varchar(255) NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"crn" integer NOT NULL,
	"subject_code" text NOT NULL,
	"course_number" text NOT NULL,
	"instruction_type" text NOT NULL,
	"instruction_method" text NOT NULL,
	"section" text NOT NULL,
	"enroll" text,
	"max_enroll" text,
	"course_title" text NOT NULL,
	"credits" text,
	"prereqs" text,
	"start_time" time,
	"end_time" time,
	"days" text[]
);
--> statement-breakpoint
CREATE TABLE "course_instructor" (
	"course_id" integer NOT NULL,
	"instructor_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instructors" (
	"id" serial NOT NULL,
	"name" text NOT NULL,
	"avg_difficulty" numeric,
	"avg_rating" numeric,
	"num_ratings" integer,
	"rmp_id" integer
);
--> statement-breakpoint
ALTER TABLE "course_instructor" ADD CONSTRAINT "course_instructor_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("crn") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_instructor" ADD CONSTRAINT "course_instructor_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE VIEW "public"."all_course_instructor_data" AS (SELECT i.id AS instructor_id, i.name AS instructor_name, i.rmp_id AS instructor_rmp_id, i.avg_difficulty, i.avg_rating, i.num_ratings, c.crn AS course_id, c.subject_code, c.course_number, c.instruction_type, c.instruction_method, c.section, c.enroll, c.max_enroll, c.course_title, c.credits, c.prereqs, c.start_time, c.end_time, c.days FROM courses c LEFT JOIN course_instructor ci ON c.crn = ci.course_id LEFT JOIN instructors i ON i.id = ci.instructor_id);
*/