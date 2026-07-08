-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."academic_year_term" AS ENUM('fall', 'winter', 'spring', 'summer');--> statement-breakpoint
CREATE TYPE "public"."citizenship_restriction" AS ENUM('No Restriction', 'Resident Alien (Green Card) or US Citizen', 'US Citizen Only');--> statement-breakpoint
CREATE TYPE "public"."compensation_status" AS ENUM('Unpaid Position', 'Hourly Paid or Salaried Position');--> statement-breakpoint
CREATE TYPE "public"."coop_cycle" AS ENUM('Fall/Winter', 'Winter/Spring', 'Spring/Summer', 'Summer/Fall');--> statement-breakpoint
CREATE TYPE "public"."coop_sequence" AS ENUM('Only', 'First', 'Second', 'Third');--> statement-breakpoint
CREATE TYPE "public"."coop_year" AS ENUM('1st', '2nd', '3rd');--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('Advanced', 'Beginner', 'Intermediate');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('Inactive', 'Pending', 'Cancelled', 'Active', 'Delete');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('Co-op Experience', 'Graduate Co-op Experience', 'Summer-Only Coop');--> statement-breakpoint
CREATE TYPE "public"."program_level" AS ENUM('Undergraduate', 'Graduate');--> statement-breakpoint
CREATE TABLE "company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" text,
	CONSTRAINT "company_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"program_level" "program_level" NOT NULL,
	"work_hours" integer DEFAULT 40 NOT NULL,
	"coop_cycle" "coop_cycle" NOT NULL,
	"coop_year" "coop_year" NOT NULL,
	"year" integer NOT NULL,
	"compensation" double precision,
	"other_compensation" varchar(255),
	"details" varchar(255),
	"owner_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" uuid PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"course_number" text NOT NULL,
	"title" text NOT NULL,
	"credits" numeric(5, 1),
	"credit_range" text,
	"description" text,
	"writing_intensive" boolean DEFAULT false NOT NULL,
	"repeat_status" text,
	"restrictions" text
);
--> statement-breakpoint
CREATE TABLE "position_review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_id" uuid NOT NULL,
	"job_id" varchar(20) NOT NULL,
	"review_index" integer DEFAULT 1 NOT NULL,
	"coop_cycle" "coop_cycle" NOT NULL,
	"year" integer NOT NULL,
	"coop_sequence" "coop_sequence",
	"department" varchar(255),
	"days_per_week" integer,
	"shift_work_required" boolean,
	"overtime_required" boolean,
	"public_transit_available" boolean,
	"employer_housing_assistance" boolean,
	"rating_collaboration" smallint,
	"rating_work_variety" smallint,
	"rating_relationships" smallint,
	"rating_supervisor_access" smallint,
	"rating_training" smallint,
	"rating_overall" smallint,
	"would_recommend" boolean,
	"description_accurate" boolean,
	"best_features" text,
	"challenges" text,
	"resume_description" text,
	"comp_written_comm" smallint,
	"comp_verbal_comm" smallint,
	"comp_comm_style" smallint,
	"comp_original_ideas" smallint,
	"comp_problem_solving" smallint,
	"comp_info_evaluation" smallint,
	"comp_data_decisions" smallint,
	"comp_ethical_standards" smallint,
	"comp_technology_use" smallint,
	"comp_goal_setting" smallint,
	"comp_diversity" smallint,
	"comp_work_habits" smallint,
	"comp_proactive" smallint,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "position_review_position_id_job_id_review_index_unique" UNIQUE("position_id","job_id","review_index")
);
--> statement-breakpoint
CREATE TABLE "college" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "position" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" text,
	CONSTRAINT "position_company_id_name_unique" UNIQUE("company_id","name")
);
--> statement-breakpoint
CREATE TABLE "job_posting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_id" uuid NOT NULL,
	"location_id" uuid,
	"job_type" "job_type" NOT NULL,
	"job_status" "job_status" DEFAULT 'Inactive' NOT NULL,
	"coop_cycle" "coop_cycle" NOT NULL,
	"year" integer NOT NULL,
	"job_length" integer DEFAULT 2 NOT NULL,
	"work_hours" integer DEFAULT 40 NOT NULL,
	"openings" integer DEFAULT 1,
	"division_description" varchar(10000),
	"position_description" varchar(15000),
	"recommended_qualifications" varchar(5000),
	"minimum_gpa" double precision,
	"is_nonprofit" boolean DEFAULT false,
	"exposure_hazardous_materials" boolean DEFAULT false,
	"is_research_position" boolean DEFAULT false,
	"is_third_party_employer" boolean DEFAULT false,
	"travel_required" boolean DEFAULT false,
	"citizenship_restriction" "citizenship_restriction" NOT NULL,
	"pre_employment_screening" varchar(1000) DEFAULT 'None',
	"transportation" varchar(1000),
	"compensation_status" "compensation_status" NOT NULL,
	"compensation_details" varchar(5000),
	"other_compensation" varchar(5000),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section" (
	"crn" integer NOT NULL,
	"course_id" uuid NOT NULL,
	"subject_code" text NOT NULL,
	"course_number" text NOT NULL,
	"term_id" integer NOT NULL,
	"section" text NOT NULL,
	"max_enroll" integer,
	"start_time" time,
	"end_time" time,
	"instruction_method" text,
	"instruction_type" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "section_crn_term_id_unique" UNIQUE("crn","term_id")
);
--> statement-breakpoint
CREATE TABLE "subject" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"college_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instructor" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"department" text,
	"rmp_legacy_id" integer,
	"rmp_id" text,
	"num_ratings" integer,
	"avg_rating" numeric(3, 1),
	"avg_difficulty" numeric(3, 1)
);
--> statement-breakpoint
CREATE TABLE "old_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "old_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state_code" varchar(3) NOT NULL,
	"state" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	CONSTRAINT "location_state_code_state_city_unique" UNIQUE("state_code","state","city")
);
--> statement-breakpoint
CREATE TABLE "major" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_level" "program_level" NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "major_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "minor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_level" "program_level" NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "minor_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "term" (
	"id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_anonymous" boolean DEFAULT false,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "__drizzle_migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"created_at" bigint
);
--> statement-breakpoint
CREATE TABLE "course_corequisites" (
	"course_id" uuid NOT NULL,
	"corequisite_course_id" uuid NOT NULL,
	CONSTRAINT "course_corequisites_course_id_corequisite_course_id_pk" PRIMARY KEY("course_id","corequisite_course_id")
);
--> statement-breakpoint
CREATE TABLE "instructor_sections" (
	"instructor_id" integer NOT NULL,
	"section_id" uuid NOT NULL,
	CONSTRAINT "instructor_sections_instructor_id_section_id_pk" PRIMARY KEY("instructor_id","section_id")
);
--> statement-breakpoint
CREATE TABLE "instructor_courses" (
	"instructor_id" integer NOT NULL,
	"course_id" uuid NOT NULL,
	CONSTRAINT "instructor_courses_instructor_id_course_id_pk" PRIMARY KEY("instructor_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "section_days" (
	"day" "day_of_week" NOT NULL,
	"section_id" uuid NOT NULL,
	CONSTRAINT "section_days_section_id_day_pk" PRIMARY KEY("day","section_id")
);
--> statement-breakpoint
CREATE TABLE "job_experience_levels" (
	"job_posting_id" uuid NOT NULL,
	"experience_level" "experience_level" NOT NULL,
	CONSTRAINT "job_experience_levels_job_posting_id_experience_level_pk" PRIMARY KEY("job_posting_id","experience_level")
);
--> statement-breakpoint
CREATE TABLE "job_posting_major" (
	"job_posting_id" uuid NOT NULL,
	"major_id" uuid NOT NULL,
	CONSTRAINT "job_posting_major_job_posting_id_major_id_pk" PRIMARY KEY("job_posting_id","major_id")
);
--> statement-breakpoint
CREATE TABLE "profile_minor" (
	"user_id" text NOT NULL,
	"minor_id" uuid NOT NULL,
	CONSTRAINT "profile_minor_user_id_minor_id_pk" PRIMARY KEY("user_id","minor_id")
);
--> statement-breakpoint
CREATE TABLE "profile_major" (
	"user_id" text NOT NULL,
	"major_id" uuid NOT NULL,
	CONSTRAINT "profile_major_user_id_major_id_pk" PRIMARY KEY("user_id","major_id")
);
--> statement-breakpoint
CREATE TABLE "course_history" (
	"course_id" uuid NOT NULL,
	"academic_year" text NOT NULL,
	"term" "academic_year_term" NOT NULL,
	CONSTRAINT "course_history_course_id_academic_year_term_pk" PRIMARY KEY("course_id","academic_year","term")
);
--> statement-breakpoint
CREATE TABLE "course_prerequisites" (
	"course_id" uuid NOT NULL,
	"prerequisite_course_id" uuid NOT NULL,
	"relationship_type" text NOT NULL,
	"group_id" text NOT NULL,
	"can_take_concurrent" boolean DEFAULT false NOT NULL,
	"minimum_grade" text,
	CONSTRAINT "course_prerequisites_course_id_prerequisite_course_id_pk" PRIMARY KEY("course_id","prerequisite_course_id")
);
--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_position_id_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."position"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_review" ADD CONSTRAINT "position_review_position_id_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."position"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position" ADD CONSTRAINT "position_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position" ADD CONSTRAINT "position_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_position_id_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."position"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_subject_code_subject_id_fk" FOREIGN KEY ("subject_code") REFERENCES "public"."subject"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_term_id_term_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."term"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject" ADD CONSTRAINT "subject_college_id_college_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."college"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_corequisites" ADD CONSTRAINT "course_corequisites_corequisite_course_id_course_id_fk" FOREIGN KEY ("corequisite_course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_corequisites" ADD CONSTRAINT "course_corequisites_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_sections" ADD CONSTRAINT "instructor_sections_instructor_id_instructor_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_sections" ADD CONSTRAINT "instructor_sections_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_courses" ADD CONSTRAINT "instructor_courses_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_courses" ADD CONSTRAINT "instructor_courses_instructor_id_instructor_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_days" ADD CONSTRAINT "section_days_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_experience_levels" ADD CONSTRAINT "job_experience_levels_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting_major" ADD CONSTRAINT "job_posting_major_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting_major" ADD CONSTRAINT "job_posting_major_major_id_major_id_fk" FOREIGN KEY ("major_id") REFERENCES "public"."major"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_minor" ADD CONSTRAINT "profile_minor_minor_id_minor_id_fk" FOREIGN KEY ("minor_id") REFERENCES "public"."minor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_minor" ADD CONSTRAINT "profile_minor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_major" ADD CONSTRAINT "profile_major_major_id_major_id_fk" FOREIGN KEY ("major_id") REFERENCES "public"."major"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_major" ADD CONSTRAINT "profile_major_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_history" ADD CONSTRAINT "course_history_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_prerequisite_course_id_course_id_fk" FOREIGN KEY ("prerequisite_course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_subject_id_index" ON "course" USING btree ("subject_id" text_ops);--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "section_course_id_index" ON "section" USING btree ("course_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "section_crn_index" ON "section" USING btree ("crn" int4_ops);--> statement-breakpoint
CREATE INDEX "section_subject_code_index" ON "section" USING btree ("subject_code" text_ops);--> statement-breakpoint
CREATE INDEX "section_term_id_index" ON "section" USING btree ("term_id" int4_ops);--> statement-breakpoint
CREATE INDEX "subject_college_id_index" ON "subject" USING btree ("college_id" text_ops);--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier" text_ops);--> statement-breakpoint
CREATE INDEX "instructor_sections_section_id_index" ON "instructor_sections" USING btree ("section_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "instructor_courses_course_id_index" ON "instructor_courses" USING btree ("course_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "course_history_academic_year_index" ON "course_history" USING btree ("academic_year" text_ops);--> statement-breakpoint
CREATE INDEX "course_history_term_index" ON "course_history" USING btree ("term" enum_ops);--> statement-breakpoint
CREATE INDEX "course_prerequisites_prerequisite_course_id_index" ON "course_prerequisites" USING btree ("prerequisite_course_id" uuid_ops);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."company_detail_m_view" AS (SELECT company.id, company.name, count(DISTINCT position_review.id) AS total_reviews, count(DISTINCT "position".id) FILTER (WHERE position_review.id IS NOT NULL) AS positions_reviewed, count(DISTINCT submission.id) AS total_submissions, round(avg(submission.compensation)::numeric, 2) AS avg_compensation, round(percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY submission.compensation)::numeric, 2) AS median_compensation, round((0.30 * ((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0) + 0.25 * (count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric) + 0.15 * (count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric) + 0.20 * ((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0) + 0.10 * (1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0))) * 100::numeric, 1) AS omega_score, round((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0 * 100::numeric, 1) AS satisfaction_score, round(count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric * 100::numeric, 1) AS trust_score, round(count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric * 100::numeric, 1) AS integrity_score, round((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0 * 100::numeric, 1) AS growth_score, round((1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0)) * 100::numeric, 1) AS work_life_score, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, round(avg(position_review.rating_collaboration), 2) AS avg_rating_collaboration, round(avg(position_review.rating_work_variety), 2) AS avg_rating_work_variety, round(avg(position_review.rating_relationships), 2) AS avg_rating_relationships, round(avg(position_review.rating_supervisor_access), 2) AS avg_rating_supervisor_access, round(avg(position_review.rating_training), 2) AS avg_rating_training, round(100.0 * count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric, 1) AS pct_would_recommend, round(100.0 * count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric, 1) AS pct_description_accurate, round(avg(position_review.days_per_week), 1) AS avg_days_per_week, round(100.0 * count(*) FILTER (WHERE position_review.public_transit_available = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.public_transit_available IS NOT NULL), 0)::numeric, 1) AS pct_public_transit, round(100.0 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric, 1) AS pct_overtime_required FROM company JOIN "position" ON "position".company_id = company.id LEFT JOIN position_review ON position_review.position_id = "position".id LEFT JOIN submission ON submission.position_id = "position".id GROUP BY company.id, company.name);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."company_positions_m_view" AS (SELECT "position".id AS position_id, "position".name AS position_name, company.id AS company_id, company.name AS company_name, count(DISTINCT position_review.id) AS total_reviews, count(DISTINCT submission.id) AS total_submissions, max(job_posting.year) AS most_recent_posting_year, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, round(avg(position_review.rating_collaboration), 2) AS avg_rating_collaboration, round(avg(position_review.rating_work_variety), 2) AS avg_rating_work_variety, round(avg(position_review.rating_relationships), 2) AS avg_rating_relationships, round(avg(position_review.rating_supervisor_access), 2) AS avg_rating_supervisor_access, round(avg(position_review.rating_training), 2) AS avg_rating_training, round(avg(submission.compensation)::numeric, 2) AS avg_compensation, round(percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY submission.compensation)::numeric, 2) AS median_compensation, round((0.30 * ((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0) + 0.25 * (count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric) + 0.15 * (count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric) + 0.20 * ((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0) + 0.10 * (1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0))) * 100::numeric, 1) AS omega_score, round((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0 * 100::numeric, 1) AS satisfaction_score, round(count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric * 100::numeric, 1) AS trust_score, round(count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric * 100::numeric, 1) AS integrity_score, round((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0 * 100::numeric, 1) AS growth_score, round((1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0)) * 100::numeric, 1) AS work_life_score FROM "position" JOIN company ON company.id = "position".company_id LEFT JOIN job_posting ON job_posting.position_id = "position".id LEFT JOIN position_review ON position_review.position_id = "position".id LEFT JOIN submission ON submission.position_id = "position".id GROUP BY "position".id, "position".name, company.id, company.name);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."company_review_aggregate_m_view" AS (SELECT company.id, company.name, count(DISTINCT "position".id) FILTER (WHERE position_review.id IS NOT NULL) AS positions_with_reviews, count(position_review.id) AS total_reviews, min(position_review.year) AS first_review_year, max(position_review.year) AS last_review_year, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, round(avg(position_review.rating_collaboration), 2) AS avg_rating_collaboration, round(avg(position_review.rating_work_variety), 2) AS avg_rating_work_variety, round(avg(position_review.rating_relationships), 2) AS avg_rating_relationships, round(avg(position_review.rating_supervisor_access), 2) AS avg_rating_supervisor_access, round(avg(position_review.rating_training), 2) AS avg_rating_training, round(100.0 * count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric, 1) AS pct_would_recommend, round(100.0 * count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric, 1) AS pct_description_accurate, round(avg(position_review.days_per_week), 1) AS avg_days_per_week, round(100.0 * count(*) FILTER (WHERE position_review.public_transit_available = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.public_transit_available IS NOT NULL), 0)::numeric, 1) AS pct_public_transit, round(100.0 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric, 1) AS pct_overtime_required, round(avg(position_review.comp_written_comm), 2) AS avg_comp_written_comm, round(avg(position_review.comp_verbal_comm), 2) AS avg_comp_verbal_comm, round(avg(position_review.comp_comm_style), 2) AS avg_comp_comm_style, round(avg(position_review.comp_original_ideas), 2) AS avg_comp_original_ideas, round(avg(position_review.comp_problem_solving), 2) AS avg_comp_problem_solving, round(avg(position_review.comp_info_evaluation), 2) AS avg_comp_info_evaluation, round(avg(position_review.comp_data_decisions), 2) AS avg_comp_data_decisions, round(avg(position_review.comp_ethical_standards), 2) AS avg_comp_ethical_standards, round(avg(position_review.comp_technology_use), 2) AS avg_comp_technology_use, round(avg(position_review.comp_goal_setting), 2) AS avg_comp_goal_setting, round(avg(position_review.comp_diversity), 2) AS avg_comp_diversity, round(avg(position_review.comp_work_habits), 2) AS avg_comp_work_habits, round(avg(position_review.comp_proactive), 2) AS avg_comp_proactive, round(avg(submission.compensation)::numeric, 2) AS avg_compensation, round(percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY submission.compensation)::numeric, 2) AS median_compensation FROM company JOIN "position" ON "position".company_id = company.id LEFT JOIN position_review ON position_review.position_id = "position".id LEFT JOIN submission ON submission.position_id = "position".id GROUP BY company.id, company.name);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."position_omega_m_view" AS (SELECT "position".id AS position_id, "position".name AS position_name, company.id AS company_id, company.name AS company_name, count(position_review.id) AS total_reviews, round((0.30 * ((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0) + 0.25 * (count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric) + 0.15 * (count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric) + 0.20 * ((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0) + 0.10 * (1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0))) * 100::numeric, 1) AS omega_score, round((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0 * 100::numeric, 1) AS satisfaction_score, round(count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric * 100::numeric, 1) AS trust_score, round(count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric * 100::numeric, 1) AS integrity_score, round((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0 * 100::numeric, 1) AS growth_score, round((1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0)) * 100::numeric, 1) AS work_life_score FROM "position" JOIN company ON company.id = "position".company_id LEFT JOIN position_review ON position_review.position_id = "position".id GROUP BY "position".id, "position".name, company.id, company.name);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."instructor_sections_m_view" AS (SELECT instructor.id AS instructor_id, instructor.name AS instructor_name, section.crn AS section_crn, section.term_id, section.subject_code, section.course_number, course.title AS course_title, section.section AS section_code, section.instruction_method, section.instruction_type FROM instructor JOIN instructor_sections ON instructor_sections.instructor_id = instructor.id JOIN section ON section.id = instructor_sections.section_id JOIN course ON course.id = section.course_id JOIN subject ON subject.id = section.subject_code);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."position_review_aggregate_m_view" AS (SELECT "position".id AS position_id, "position".name AS position_name, company.name AS company_name, count(position_review.id) AS total_reviews, min(position_review.year) AS first_review_year, max(position_review.year) AS last_review_year, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, round(avg(position_review.rating_collaboration), 2) AS avg_rating_collaboration, round(avg(position_review.rating_work_variety), 2) AS avg_rating_work_variety, round(avg(position_review.rating_relationships), 2) AS avg_rating_relationships, round(avg(position_review.rating_supervisor_access), 2) AS avg_rating_supervisor_access, round(avg(position_review.rating_training), 2) AS avg_rating_training, round(100.0 * count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric, 1) AS pct_would_recommend, round(100.0 * count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric, 1) AS pct_description_accurate, round(avg(position_review.days_per_week), 1) AS avg_days_per_week, round(100.0 * count(*) FILTER (WHERE position_review.public_transit_available = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.public_transit_available IS NOT NULL), 0)::numeric, 1) AS pct_public_transit, round(100.0 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric, 1) AS pct_overtime_required, round(avg(position_review.comp_written_comm), 2) AS avg_comp_written_comm, round(avg(position_review.comp_verbal_comm), 2) AS avg_comp_verbal_comm, round(avg(position_review.comp_comm_style), 2) AS avg_comp_comm_style, round(avg(position_review.comp_original_ideas), 2) AS avg_comp_original_ideas, round(avg(position_review.comp_problem_solving), 2) AS avg_comp_problem_solving, round(avg(position_review.comp_info_evaluation), 2) AS avg_comp_info_evaluation, round(avg(position_review.comp_data_decisions), 2) AS avg_comp_data_decisions, round(avg(position_review.comp_ethical_standards), 2) AS avg_comp_ethical_standards, round(avg(position_review.comp_technology_use), 2) AS avg_comp_technology_use, round(avg(position_review.comp_goal_setting), 2) AS avg_comp_goal_setting, round(avg(position_review.comp_diversity), 2) AS avg_comp_diversity, round(avg(position_review.comp_work_habits), 2) AS avg_comp_work_habits, round(avg(position_review.comp_proactive), 2) AS avg_comp_proactive FROM "position" JOIN company ON company.id = "position".company_id LEFT JOIN position_review ON position_review.position_id = "position".id GROUP BY "position".id, "position".name, company.name);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."position_information_m_view" AS (SELECT "position".id AS position_id, "position".name AS position_name, company.id AS company_id, company.name AS company_name, max(job_posting.year) AS most_recent_posting_year, count(DISTINCT position_review.id) AS total_reviews, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, count(DISTINCT submission.id) AS total_submissions, round(avg(submission.compensation)::numeric, 2) AS avg_compensation, round(percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY submission.compensation)::numeric, 2) AS median_compensation FROM "position" JOIN company ON company.id = "position".company_id LEFT JOIN job_posting ON job_posting.position_id = "position".id LEFT JOIN position_review ON position_review.position_id = "position".id LEFT JOIN submission ON submission.position_id = "position".id GROUP BY "position".id, "position".name, company.id, company.name);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."meili_companies_m_idx" AS (SELECT company.id AS company_id, company.name AS company_name, array_agg(DISTINCT "position".name) AS positions, count(DISTINCT position_review.id) AS total_reviews, count(DISTINCT "position".id) FILTER (WHERE position_review.id IS NOT NULL) AS positions_reviewed, count(DISTINCT submission.id) AS total_submissions, round(avg(submission.compensation)::numeric, 2) AS avg_compensation, round(percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY submission.compensation)::numeric, 2) AS median_compensation, round((0.30 * ((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0) + 0.25 * (count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric) + 0.15 * (count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric) + 0.20 * ((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0) + 0.10 * (1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0))) * 100::numeric, 1) AS omega_score, round((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0 * 100::numeric, 1) AS satisfaction_score, round(count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric * 100::numeric, 1) AS trust_score, round(count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric * 100::numeric, 1) AS integrity_score, round((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0 * 100::numeric, 1) AS growth_score, round((1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0)) * 100::numeric, 1) AS work_life_score, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, round(100.0 * count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric, 1) AS pct_would_recommend, round(100.0 * count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric, 1) AS pct_description_accurate, round(avg(position_review.days_per_week), 1) AS avg_days_per_week, round(100.0 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric, 1) AS pct_overtime_required, min(position_review.year) AS first_review_year, max(position_review.year) AS last_review_year FROM company JOIN "position" ON "position".company_id = company.id LEFT JOIN position_review ON position_review.position_id = "position".id LEFT JOIN submission ON submission.position_id = "position".id GROUP BY company.id, company.name);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."submissions_m_view" WITH (fillfactor = 90) AS (SELECT submission.id, submission.year, submission.coop_year, submission.coop_cycle, submission.program_level, submission.work_hours, submission.compensation, submission.other_compensation, submission.details, submission.owner_id, submission.created_at, company.id AS company_id, "position".id AS position_id, company.name AS company_name, "position".name AS position_name, location.city, location.state, location.state_code, (((((((((((COALESCE(company.name, ''::character varying)::text || ' '::text) || COALESCE("position".name, ''::character varying)::text) || ' '::text) || COALESCE(location.city, ''::character varying)::text) || ' '::text) || COALESCE(location.state, ''::character varying)::text) || ' '::text) || COALESCE(location.state_code, ''::character varying)::text) || ' '::text) || COALESCE(submission.details, ''::character varying)::text) || ' '::text) || COALESCE(submission.other_compensation, ''::character varying)::text AS search_text FROM submission LEFT JOIN "position" ON submission.position_id = "position".id LEFT JOIN location ON submission.location_id = location.id LEFT JOIN company ON "position".company_id = company.id);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."meili_sections_m_idx" AS (SELECT section.crn, section.section, section.course_number, section.instruction_type, section.instruction_method, course.credits, section.max_enroll, section.start_time, section.end_time, COALESCE(array_agg(DISTINCT section_days.day::text) FILTER (WHERE section_days.day IS NOT NULL), '{}'::text[]) AS days, section.term_id::text AS term, (subject.id || ' '::text) || section.course_number AS course, course.title, course.description, course.restrictions, course.repeat_status, course.writing_intensive, subject.id AS subject_id, subject.name AS subject_name, college.id AS college_id, college.name AS college_name, course.id AS course_id, COALESCE(json_agg(DISTINCT jsonb_build_object('id', instructor.id, 'name', instructor.name, 'department', instructor.department, 'avg_rating', instructor.avg_rating::double precision, 'avg_difficulty', instructor.avg_difficulty::double precision, 'num_ratings', instructor.num_ratings, 'rmp_id', instructor.rmp_id, 'rmp_legacy_id', instructor.rmp_legacy_id, 'weighted_score', instructor.num_ratings::double precision * instructor.avg_rating::double precision)) FILTER (WHERE instructor.id IS NOT NULL), '[]'::json) AS instructors FROM section JOIN course ON course.id = section.course_id JOIN subject ON subject.id = section.subject_code JOIN college ON college.id = subject.college_id JOIN term ON term.id = section.term_id LEFT JOIN section_days ON section_days.section_id = section.id LEFT JOIN instructor_sections ON instructor_sections.section_id = section.id LEFT JOIN instructor ON instructor.id = instructor_sections.instructor_id GROUP BY section.crn, section.section, section.course_number, section.instruction_type, section.instruction_method, section.max_enroll, section.start_time, section.end_time, section.term_id, course.id, course.title, course.description, course.credits, course.restrictions, course.repeat_status, course.writing_intensive, subject.id, subject.name, college.id, college.name);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."corequisites_m_view" WITH (fillfactor = 90) AS (SELECT course_corequisites.course_id, course.title AS course_title, course.subject_id AS course_subject_id, course.course_number, coreq_course.id AS coreq_id, coreq_course.title AS coreq_title, coreq_course.subject_id AS coreq_subject_id, coreq_course.course_number AS coreq_course_number FROM course_corequisites JOIN course ON course.id = course_corequisites.course_id JOIN course coreq_course ON coreq_course.id = course_corequisites.corequisite_course_id);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."meili_professors_m_idx" AS (SELECT instructor.id, instructor.name, instructor.department, instructor.avg_rating, instructor.avg_difficulty, instructor.num_ratings, instructor.rmp_id, instructor.rmp_legacy_id, instructor.num_ratings::numeric * instructor.avg_rating AS weighted_score, count(DISTINCT section.crn) AS total_sections_taught, count(DISTINCT course.id) AS total_courses_taught, count(DISTINCT section.term_id) AS total_terms_active, max(section.term_id) AS most_recent_term, array_agg(DISTINCT subject.id) AS subjects_taught, array_agg(DISTINCT section.instruction_method) AS instruction_methods, COALESCE(json_agg(DISTINCT jsonb_build_object('code', (subject.id || ' '::text) || section.course_number, 'title', course.title)) FILTER (WHERE course.id IS NOT NULL), '[]'::json) AS courses_taught FROM instructor LEFT JOIN instructor_sections ON instructor_sections.instructor_id = instructor.id LEFT JOIN section ON section.id = instructor_sections.section_id LEFT JOIN course ON course.id = section.course_id LEFT JOIN subject ON subject.id = section.subject_code GROUP BY instructor.id, instructor.name, instructor.department, instructor.avg_rating, instructor.avg_difficulty, instructor.num_ratings, instructor.rmp_id, instructor.rmp_legacy_id);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."prerequisites_m_view" WITH (fillfactor = 90) AS (SELECT course_prerequisites.course_id, course.title AS course_title, course.subject_id AS course_subject_id, course.course_number, prereq_course.id AS prereq_id, prereq_course.title AS prereq_title, prereq_course.subject_id AS prereq_subject_id, prereq_course.course_number AS prereq_course_number, course_prerequisites.relationship_type, course_prerequisites.group_id, course_prerequisites.can_take_concurrent, course_prerequisites.minimum_grade FROM course_prerequisites JOIN course ON course.id = course_prerequisites.course_id JOIN course prereq_course ON prereq_course.id = course_prerequisites.prerequisite_course_id);
*/