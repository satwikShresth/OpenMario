CREATE TYPE "public"."event_type" AS ENUM('unavailable', 'course');--> statement-breakpoint
CREATE TYPE "public"."term" AS ENUM('Fall', 'Winter', 'Spring', 'Summer');--> statement-breakpoint
CREATE TABLE "courses_taken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar(255) NOT NULL,
	"course_name" varchar(255) NOT NULL,
	"subject_id" varchar(50) NOT NULL,
	"course_number" varchar(10) NOT NULL,
	"term" "term" NOT NULL,
	"year" integer NOT NULL,
	"grade" varchar(5),
	"credits" integer,
	"crn" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "event_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"start" timestamp,
	"end" timestamp,
	"days" varchar(255),
	"start_time" varchar(10),
	"end_time" varchar(10),
	"term" "term" NOT NULL,
	"year" integer NOT NULL,
	"course_id" varchar(255),
	"crn" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "courses_taken_course_id_idx" ON "courses_taken" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "courses_taken_term_year_idx" ON "courses_taken" USING btree ("term","year");--> statement-breakpoint
CREATE INDEX "courses_taken_subject_idx" ON "courses_taken" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "plan_events_term_year_idx" ON "plan_events" USING btree ("term","year");--> statement-breakpoint
CREATE INDEX "plan_events_type_idx" ON "plan_events" USING btree ("type");