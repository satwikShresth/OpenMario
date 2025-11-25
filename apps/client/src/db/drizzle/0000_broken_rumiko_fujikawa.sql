CREATE TYPE "public"."coop_cycle" AS ENUM('Fall/Winter', 'Winter/Spring', 'Spring/Summer', 'Summer/Fall');--> statement-breakpoint
CREATE TYPE "public"."coop_year" AS ENUM('1st', '2nd', '3rd');--> statement-breakpoint
CREATE TYPE "public"."program_level" AS ENUM('Undergraduate', 'Graduate');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('draft', 'pending', 'synced', 'failed');--> statement-breakpoint
CREATE TABLE "company_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company" varchar(100) NOT NULL,
	"company_id" varchar(255) NOT NULL,
	"position" varchar(100) NOT NULL,
	"position_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crn" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_sections_crn_unique" UNIQUE("crn")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid,
	"owner_id" varchar(255),
	"status" "submission_status" DEFAULT 'draft' NOT NULL,
	"is_draft" boolean DEFAULT true NOT NULL,
	"company" varchar(100) NOT NULL,
	"company_id" varchar(255),
	"position" varchar(100) NOT NULL,
	"position_id" varchar(255),
	"location" varchar(255) NOT NULL,
	"location_city" varchar(100),
	"location_state" varchar(100),
	"location_state_code" varchar(2),
	"year" integer NOT NULL,
	"coop_year" "coop_year" NOT NULL,
	"coop_cycle" "coop_cycle" NOT NULL,
	"program_level" "program_level" NOT NULL,
	"work_hours" integer NOT NULL,
	"compensation" integer NOT NULL,
	"other_compensation" varchar(255),
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"synced_at" timestamp,
	CONSTRAINT "submissions_server_id_unique" UNIQUE("server_id")
);
--> statement-breakpoint
CREATE INDEX "company_positions_idx" ON "company_positions" USING btree ("company_id","position_id");--> statement-breakpoint
CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "submissions_is_draft_idx" ON "submissions" USING btree ("is_draft");--> statement-breakpoint
CREATE INDEX "submissions_company_idx" ON "submissions" USING btree ("company");--> statement-breakpoint
CREATE INDEX "submissions_server_id_idx" ON "submissions" USING btree ("server_id");
