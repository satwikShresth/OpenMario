CREATE TYPE "public"."citizenship_restriction" AS ENUM('No Restriction', 'Resident Alien (Green Card) or US Citizen', 'US Citizen Only');--> statement-breakpoint
CREATE TYPE "public"."compensation_status" AS ENUM('Unpaid Position', 'Hourly Paid or Salaried Position');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('Advanced', 'Beginner', 'Intermediate');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('Inactive', 'Pending', 'Cancelled', 'Active', 'Delete');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('Co-op Experience', 'Graduate Co-op Experience', 'Summer-Only Coop');--> statement-breakpoint
CREATE TABLE "job_experience_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"experience_level" "experience_level" NOT NULL,
	"description" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "job_posting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_id" uuid NOT NULL,
	"external_employer_id" varchar(50),
	"external_position_id" varchar(50),
	"job_type" "job_type" NOT NULL,
	"job_status" "job_status" DEFAULT 'Inactive' NOT NULL,
	"location_id" uuid NOT NULL,
	"coop_cycle" "coop_cycle" NOT NULL,
	"year" integer NOT NULL,
	"job_length" integer DEFAULT 2 NOT NULL,
	"hours_per_week" integer,
	"openings" integer DEFAULT 1,
	"division_description" varchar(2000),
	"position_description" varchar(2000),
	"recommended_qualifications" varchar(1000),
	"majors_sought" varchar(500),
	"minimum_gpa" double precision,
	"is_nonprofit" boolean DEFAULT false,
	"has_hazardous_materials" boolean DEFAULT false,
	"is_research_position" boolean DEFAULT false,
	"is_third_party_employer" boolean DEFAULT false,
	"travel_required" boolean DEFAULT false,
	"citizenship_restriction" "citizenship_restriction" NOT NULL,
	"pre_employment_screening" varchar(255) DEFAULT 'None',
	"transportation" varchar(255),
	"compensation_status" "compensation_status" NOT NULL,
	"compensation_details" varchar(1000),
	"compensation_other" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "job_experience_levels" ADD CONSTRAINT "job_experience_levels_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_position_id_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."position"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE restrict ON UPDATE no action;