CREATE TABLE "courses" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"course" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"credits" integer,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) NOT NULL,
	"title" varchar(255),
	"start" timestamp NOT NULL,
	"end" timestamp NOT NULL,
	"term_id" uuid NOT NULL,
	"crn" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"crn" varchar(10) PRIMARY KEY NOT NULL,
	"term_id" uuid NOT NULL,
	"course_id" varchar(255) NOT NULL,
	"status" varchar(20),
	"liked" boolean DEFAULT false NOT NULL,
	"grade" varchar(5),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term" varchar(20) NOT NULL,
	"year" integer NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "terms_term_year_unique" UNIQUE("term","year")
);
--> statement-breakpoint
ALTER TABLE "favorite_sections" DROP CONSTRAINT "favorite_sections_crn_unique";--> statement-breakpoint
ALTER TABLE "favorite_sections" ALTER COLUMN "crn" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "status" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "coop_year" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "coop_cycle" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "program_level" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "plan_events" ADD CONSTRAINT "plan_events_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_events" ADD CONSTRAINT "plan_events_crn_sections_crn_fk" FOREIGN KEY ("crn") REFERENCES "public"."sections"("crn") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_sections" ADD CONSTRAINT "favorite_sections_crn_sections_crn_fk" FOREIGN KEY ("crn") REFERENCES "public"."sections"("crn") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."coop_cycle";--> statement-breakpoint
DROP TYPE "public"."coop_year";--> statement-breakpoint
DROP TYPE "public"."program_level";--> statement-breakpoint
DROP TYPE "public"."submission_status";
