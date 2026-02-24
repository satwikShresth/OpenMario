CREATE TYPE "public"."citizenship_restriction" AS ENUM('No Restriction', 'Resident Alien (Green Card) or US Citizen', 'US Citizen Only');--> statement-breakpoint
CREATE TYPE "public"."compensation_status" AS ENUM('Unpaid Position', 'Hourly Paid or Salaried Position');--> statement-breakpoint
CREATE TYPE "public"."coop_cycle" AS ENUM('Fall/Winter', 'Winter/Spring', 'Spring/Summer', 'Summer/Fall');--> statement-breakpoint
CREATE TYPE "public"."coop_sequence" AS ENUM('Only', 'First', 'Second', 'Third');--> statement-breakpoint
CREATE TYPE "public"."coop_year" AS ENUM('1st', '2nd', '3rd');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('Advanced', 'Beginner', 'Intermediate');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('Inactive', 'Pending', 'Cancelled', 'Active', 'Delete');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('Co-op Experience', 'Graduate Co-op Experience', 'Summer-Only Coop');--> statement-breakpoint
CREATE TYPE "public"."program_level" AS ENUM('Undergraduate', 'Graduate');--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');--> statement-breakpoint
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
CREATE TABLE "verification" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "old_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "old_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "profile_major" (
	"user_id" text NOT NULL,
	"major_id" uuid NOT NULL,
	CONSTRAINT "profile_major_user_id_major_id_pk" PRIMARY KEY("user_id","major_id")
);
--> statement-breakpoint
CREATE TABLE "profile_minor" (
	"user_id" text NOT NULL,
	"minor_id" uuid NOT NULL,
	CONSTRAINT "profile_minor_user_id_minor_id_pk" PRIMARY KEY("user_id","minor_id")
);
--> statement-breakpoint
CREATE TABLE "company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" text,
	CONSTRAINT "company_name_unique" UNIQUE("name")
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
CREATE TABLE "position" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" text,
	CONSTRAINT "position_company_id_name_unique" UNIQUE("company_id","name")
);
--> statement-breakpoint
CREATE TABLE "job_experience_levels" (
	"job_posting_id" uuid NOT NULL,
	"experience_level" "experience_level" NOT NULL,
	CONSTRAINT "job_experience_levels_job_posting_id_experience_level_pk" PRIMARY KEY("job_posting_id","experience_level")
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
CREATE TABLE "job_posting_major" (
	"job_posting_id" uuid NOT NULL,
	"major_id" uuid NOT NULL,
	CONSTRAINT "job_posting_major_job_posting_id_major_id_pk" PRIMARY KEY("job_posting_id","major_id")
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
CREATE TABLE "course_corequisites" (
	"course_id" uuid NOT NULL,
	"corequisite_course_id" uuid NOT NULL,
	CONSTRAINT "course_corequisites_course_id_corequisite_course_id_pk" PRIMARY KEY("course_id","corequisite_course_id")
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
CREATE TABLE "instructor_courses" (
	"instructor_id" integer NOT NULL,
	"course_id" uuid NOT NULL,
	CONSTRAINT "instructor_courses_instructor_id_course_id_pk" PRIMARY KEY("instructor_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "instructor_sections" (
	"instructor_id" integer NOT NULL,
	"section_crn" integer NOT NULL,
	CONSTRAINT "instructor_sections_instructor_id_section_crn_pk" PRIMARY KEY("instructor_id","section_crn")
);
--> statement-breakpoint
CREATE TABLE "section" (
	"crn" integer PRIMARY KEY NOT NULL,
	"course_id" uuid NOT NULL,
	"subject_code" text NOT NULL,
	"course_number" text NOT NULL,
	"term_id" integer NOT NULL,
	"section" text NOT NULL,
	"max_enroll" integer,
	"start_time" time,
	"end_time" time,
	"instruction_method" text,
	"instruction_type" text
);
--> statement-breakpoint
CREATE TABLE "section_days" (
	"section_crn" integer NOT NULL,
	"day" "day_of_week" NOT NULL,
	CONSTRAINT "section_days_section_crn_day_pk" PRIMARY KEY("section_crn","day")
);
--> statement-breakpoint
CREATE TABLE "subject" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"college_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "term" (
	"id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_major" ADD CONSTRAINT "profile_major_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_major" ADD CONSTRAINT "profile_major_major_id_major_id_fk" FOREIGN KEY ("major_id") REFERENCES "public"."major"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_minor" ADD CONSTRAINT "profile_minor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_minor" ADD CONSTRAINT "profile_minor_minor_id_minor_id_fk" FOREIGN KEY ("minor_id") REFERENCES "public"."minor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position" ADD CONSTRAINT "position_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position" ADD CONSTRAINT "position_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_experience_levels" ADD CONSTRAINT "job_experience_levels_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_position_id_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."position"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting_major" ADD CONSTRAINT "job_posting_major_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting_major" ADD CONSTRAINT "job_posting_major_major_id_major_id_fk" FOREIGN KEY ("major_id") REFERENCES "public"."major"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_position_id_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."position"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_review" ADD CONSTRAINT "position_review_position_id_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."position"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_corequisites" ADD CONSTRAINT "course_corequisites_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_corequisites" ADD CONSTRAINT "course_corequisites_corequisite_course_id_course_id_fk" FOREIGN KEY ("corequisite_course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_prerequisite_course_id_course_id_fk" FOREIGN KEY ("prerequisite_course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_courses" ADD CONSTRAINT "instructor_courses_instructor_id_instructor_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_courses" ADD CONSTRAINT "instructor_courses_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_sections" ADD CONSTRAINT "instructor_sections_instructor_id_instructor_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_sections" ADD CONSTRAINT "instructor_sections_section_crn_section_crn_fk" FOREIGN KEY ("section_crn") REFERENCES "public"."section"("crn") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_subject_code_subject_id_fk" FOREIGN KEY ("subject_code") REFERENCES "public"."subject"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_term_id_term_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."term"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_days" ADD CONSTRAINT "section_days_section_crn_section_crn_fk" FOREIGN KEY ("section_crn") REFERENCES "public"."section"("crn") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject" ADD CONSTRAINT "subject_college_id_college_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."college"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "course_subject_id_index" ON "course" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "course_prerequisites_prerequisite_course_id_index" ON "course_prerequisites" USING btree ("prerequisite_course_id");--> statement-breakpoint
CREATE INDEX "instructor_courses_course_id_index" ON "instructor_courses" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "instructor_sections_section_crn_index" ON "instructor_sections" USING btree ("section_crn");--> statement-breakpoint
CREATE INDEX "section_course_id_index" ON "section" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "section_term_id_index" ON "section" USING btree ("term_id");--> statement-breakpoint
CREATE INDEX "section_subject_code_index" ON "section" USING btree ("subject_code");--> statement-breakpoint
CREATE INDEX "subject_college_id_index" ON "subject" USING btree ("college_id");--> statement-breakpoint
CREATE VIEW "public"."meili_companies_idx" AS (select "company"."id", "company"."name", array_agg(distinct "position"."name") as "positions", count(distinct "position_review"."id") as "total_reviews", count(distinct "position"."id") filter (where "position_review"."id" is not null) as "positions_reviewed", count(distinct "submission"."id") as "total_submissions", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation", round((
   0.30 * (
      (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
       avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
       avg("position_review"."rating_training")) / 5.0 / 4.0
   ) +
   0.25 * (
      count(*) filter (where "position_review"."would_recommend" = true)::numeric
      / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0)
   ) +
   0.15 * (
      count(*) filter (where "position_review"."description_accurate" = true)::numeric
      / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0)
   ) +
   0.20 * (
      (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
       avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
       avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
       avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
       avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
       avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
       avg("position_review"."comp_proactive")) / 13.0 / 4.0
   ) +
   0.10 * (
      1.0 - (
         0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
             / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
         +
         0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
      )
   )
) * 100, 1) as "omega_score", round(
            (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
             avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
             avg("position_review"."rating_training")) / 5.0 / 4.0 * 100, 1) as "satisfaction_score", round(
            count(*) filter (where "position_review"."would_recommend" = true)::numeric
            / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0) * 100, 1) as "trust_score", round(
            count(*) filter (where "position_review"."description_accurate" = true)::numeric
            / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0) * 100, 1) as "integrity_score", round(
            (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
             avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
             avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
             avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
             avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
             avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
             avg("position_review"."comp_proactive")) / 13.0 / 4.0 * 100, 1) as "growth_score", round((
            1.0 - (
               0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
                   / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
               +
               0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
            )
         ) * 100, 1) as "work_life_score", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", round(
            100.0 * count(*) filter (where "position_review"."would_recommend" = true)
            / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0), 1) as "pct_would_recommend", round(
            100.0 * count(*) filter (where "position_review"."description_accurate" = true)
            / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0), 1) as "pct_description_accurate", round(avg("position_review"."days_per_week")::numeric, 1) as "avg_days_per_week", round(
            100.0 * count(*) filter (where "position_review"."overtime_required" = true)
            / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0), 1) as "pct_overtime_required", min("position_review"."year") as "first_review_year", max("position_review"."year") as "last_review_year" from "company" inner join "position" on "position"."company_id" = "company"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "company"."id", "company"."name");--> statement-breakpoint
CREATE VIEW "public"."meili_professors_idx" AS (select "instructor"."id" as "id", "instructor"."name" as "name", "instructor"."department", "instructor"."avg_rating", "instructor"."avg_difficulty", "instructor"."num_ratings", "instructor"."rmp_id", "instructor"."rmp_legacy_id", "instructor"."num_ratings" * "instructor"."avg_rating" as "weighted_score", count(distinct "section"."crn") as "total_sections_taught", count(distinct "course"."id") as "total_courses_taught", count(distinct "section"."term_id") as "total_terms_active", max("section"."term_id") as "most_recent_term", array_agg(distinct "subject"."id") as "subjects_taught", array_agg(distinct "section"."instruction_method") as "instruction_methods", coalesce(
            json_agg(distinct jsonb_build_object(
               'code', "subject"."id" || ' ' || "section"."course_number",
               'title', "course"."title"
            )) filter (where "course"."id" is not null),
            '[]'
         ) as "courses_taught" from "instructor" left join "instructor_sections" on "instructor_sections"."instructor_id" = "instructor"."id" left join "section" on "section"."crn" = "instructor_sections"."section_crn" left join "course" on "course"."id" = "section"."course_id" left join "subject" on "subject"."id" = "section"."subject_code" group by "instructor"."id", "instructor"."name", "instructor"."department", "instructor"."avg_rating", "instructor"."avg_difficulty", "instructor"."num_ratings", "instructor"."rmp_id", "instructor"."rmp_legacy_id");--> statement-breakpoint
CREATE VIEW "public"."meili_sections_idx" AS (select "section"."crn", "section"."section" as "section", "section"."course_number", "section"."instruction_type", "section"."instruction_method", "course"."credits", "section"."max_enroll", "section"."start_time", "section"."end_time", coalesce(
            array_agg(distinct "section_days"."day"::text) filter (where "section_days"."day" is not null),
            '{}'
         ) as "days", "section"."term_id"::text as "term", "subject"."id" || ' ' || "section"."course_number" as "course", "course"."title", "course"."description", "course"."restrictions", "course"."repeat_status", "course"."writing_intensive", "subject"."id" as "subject_id", "subject"."name", "college"."id" as "college_id", "college"."name", "course"."id" as "course_id", coalesce(
            json_agg(
               distinct jsonb_build_object(
                  'id',             "instructor"."id",
                  'name',           "instructor"."name",
                  'department',     "instructor"."department",
                  'avg_rating',     "instructor"."avg_rating"::float,
                  'avg_difficulty', "instructor"."avg_difficulty"::float,
                  'num_ratings',    "instructor"."num_ratings",
                  'rmp_id',         "instructor"."rmp_id",
                  'weighted_score', ("instructor"."num_ratings" * "instructor"."avg_rating"::float)
               )
            ) filter (where "instructor"."id" is not null),
            '[]'
         ) as "instructors" from "section" inner join "course" on "course"."id" = "section"."course_id" inner join "subject" on "subject"."id" = "section"."subject_code" inner join "college" on "college"."id" = "subject"."college_id" inner join "term" on "term"."id" = "section"."term_id" left join "section_days" on "section_days"."section_crn" = "section"."crn" left join "instructor_sections" on "instructor_sections"."section_crn" = "section"."crn" left join "instructor" on "instructor"."id" = "instructor_sections"."instructor_id" group by "section"."crn", "section"."section", "section"."course_number", "section"."instruction_type", "section"."instruction_method", "section"."max_enroll", "section"."start_time", "section"."end_time", "section"."term_id", "course"."id", "course"."title", "course"."description", "course"."credits", "course"."restrictions", "course"."repeat_status", "course"."writing_intensive", "subject"."id", "subject"."name", "college"."id", "college"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."submissions_m_view" WITH (fillfactor = 90) AS (select "submission"."id", "submission"."year", "submission"."coop_year", "submission"."coop_cycle", "submission"."program_level", "submission"."work_hours", "submission"."compensation", "submission"."other_compensation", "submission"."details", "submission"."owner_id", "submission"."created_at", "company"."id" as "company_id", "position"."id" as "position_id", "company"."name" as "company_name", "position"."name" as "position_name", "location"."city" as "city", "location"."state" as "state", "location"."state_code" as "state_code", 
          coalesce("company"."name", '')                  || ' ' ||
          coalesce("position"."name", '')                 || ' ' ||
          coalesce("location"."city", '')                 || ' ' ||
          coalesce("location"."state", '')                || ' ' ||
          coalesce("location"."state_code", '')           || ' ' ||
          coalesce("submission"."details", '')            || ' ' ||
          coalesce("submission"."other_compensation", '')
         as "search_text" from "submission" left join "position" on "submission"."position_id" = "position"."id" left join "location" on "submission"."location_id" = "location"."id" left join "company" on "position"."company_id" = "company"."id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."instructor_sections_m_view" AS (select "instructor"."id" as "instructor_id", "instructor"."name" as "instructor_name", "section"."crn" as "section_crn", "section"."term_id" as "term_id", "section"."subject_code" as "subject_code", "section"."course_number" as "course_number", "course"."title" as "course_title", "section"."section" as "section_code", "section"."instruction_method" as "instruction_method", "section"."instruction_type" as "instruction_type" from "instructor" inner join "instructor_sections" on "instructor_sections"."instructor_id" = "instructor"."id" inner join "section" on "section"."crn" = "instructor_sections"."section_crn" inner join "course" on "course"."id" = "section"."course_id" inner join "subject" on "subject"."id" = "section"."subject_code");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."corequisites_m_view" WITH (fillfactor = 90) AS (select "course_corequisites"."course_id", "course"."title" as "course_title", "course"."subject_id" as "course_subject_id", "course"."course_number" as "course_number", "coreq_course"."id" as "coreq_id", "coreq_course"."title" as "coreq_title", "coreq_course"."subject_id" as "coreq_subject_id", "coreq_course"."course_number" as "coreq_course_number" from "course_corequisites" inner join "course" on "course"."id" = "course_corequisites"."course_id" inner join "course" "coreq_course" on "coreq_course"."id" = "course_corequisites"."corequisite_course_id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."prerequisites_m_view" WITH (fillfactor = 90) AS (select "course_prerequisites"."course_id", "course"."title" as "course_title", "course"."subject_id" as "course_subject_id", "course"."course_number" as "course_number", "prereq_course"."id" as "prereq_id", "prereq_course"."title" as "prereq_title", "prereq_course"."subject_id" as "prereq_subject_id", "prereq_course"."course_number" as "prereq_course_number", "course_prerequisites"."relationship_type", "course_prerequisites"."group_id", "course_prerequisites"."can_take_concurrent", "course_prerequisites"."minimum_grade" from "course_prerequisites" inner join "course" on "course"."id" = "course_prerequisites"."course_id" inner join "course" "prereq_course" on "prereq_course"."id" = "course_prerequisites"."prerequisite_course_id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."company_detail_m_view" AS (select "company"."id", "company"."name", count(distinct "position_review"."id") as "total_reviews", count(distinct "position"."id") filter (where "position_review"."id" is not null) as "positions_reviewed", count(distinct "submission"."id") as "total_submissions", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation", round((
      0.30 * (
         (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
          avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
          avg("position_review"."rating_training")) / 5.0 / 4.0
      ) +
      0.25 * (
         count(*) filter (where "position_review"."would_recommend" = true)::numeric
         / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0)
      ) +
      0.15 * (
         count(*) filter (where "position_review"."description_accurate" = true)::numeric
         / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0)
      ) +
      0.20 * (
         (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
          avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
          avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
          avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
          avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
          avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
          avg("position_review"."comp_proactive")) / 13.0 / 4.0
      ) +
      0.10 * (
         1.0 - (
            0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
                / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
            +
            0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
         )
      )
   ) * 100, 1) as "omega_score", round(
      (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
       avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
       avg("position_review"."rating_training")) / 5.0 / 4.0 * 100, 1) as "satisfaction_score", round(
      count(*) filter (where "position_review"."would_recommend" = true)::numeric
      / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0) * 100, 1) as "trust_score", round(
      count(*) filter (where "position_review"."description_accurate" = true)::numeric
      / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0) * 100, 1) as "integrity_score", round(
      (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
       avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
       avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
       avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
       avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
       avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
       avg("position_review"."comp_proactive")) / 13.0 / 4.0 * 100, 1) as "growth_score", round((
      1.0 - (
         0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
             / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
         +
         0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
      )
   ) * 100, 1) as "work_life_score", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", round(avg("position_review"."rating_collaboration")::numeric, 2) as "avg_rating_collaboration", round(avg("position_review"."rating_work_variety")::numeric, 2) as "avg_rating_work_variety", round(avg("position_review"."rating_relationships")::numeric, 2) as "avg_rating_relationships", round(avg("position_review"."rating_supervisor_access")::numeric, 2) as "avg_rating_supervisor_access", round(avg("position_review"."rating_training")::numeric, 2) as "avg_rating_training", round(
            100.0 * count(*) filter (where "position_review"."would_recommend" = true)
            / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0), 1) as "pct_would_recommend", round(
            100.0 * count(*) filter (where "position_review"."description_accurate" = true)
            / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0), 1) as "pct_description_accurate", round(avg("position_review"."days_per_week")::numeric, 1) as "avg_days_per_week", round(
            100.0 * count(*) filter (where "position_review"."public_transit_available" = true)
            / nullif(count(*) filter (where "position_review"."public_transit_available" is not null), 0), 1) as "pct_public_transit", round(
            100.0 * count(*) filter (where "position_review"."overtime_required" = true)
            / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0), 1) as "pct_overtime_required" from "company" inner join "position" on "position"."company_id" = "company"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."company_positions_m_view" AS (select "position"."id" as "position_id", "position"."name" as "position_name", "company"."id" as "company_id", "company"."name" as "company_name", count(distinct "position_review"."id") as "total_reviews", count(distinct "submission"."id") as "total_submissions", max("job_posting"."year") as "most_recent_posting_year", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", round(avg("position_review"."rating_collaboration")::numeric, 2) as "avg_rating_collaboration", round(avg("position_review"."rating_work_variety")::numeric, 2) as "avg_rating_work_variety", round(avg("position_review"."rating_relationships")::numeric, 2) as "avg_rating_relationships", round(avg("position_review"."rating_supervisor_access")::numeric, 2) as "avg_rating_supervisor_access", round(avg("position_review"."rating_training")::numeric, 2) as "avg_rating_training", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation", round((
      0.30 * (
         (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
          avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
          avg("position_review"."rating_training")) / 5.0 / 4.0
      ) +
      0.25 * (
         count(*) filter (where "position_review"."would_recommend" = true)::numeric
         / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0)
      ) +
      0.15 * (
         count(*) filter (where "position_review"."description_accurate" = true)::numeric
         / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0)
      ) +
      0.20 * (
         (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
          avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
          avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
          avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
          avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
          avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
          avg("position_review"."comp_proactive")) / 13.0 / 4.0
      ) +
      0.10 * (
         1.0 - (
            0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
                / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
            +
            0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
         )
      )
   ) * 100, 1) as "omega_score", round(
      (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
       avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
       avg("position_review"."rating_training")) / 5.0 / 4.0 * 100, 1) as "satisfaction_score", round(
      count(*) filter (where "position_review"."would_recommend" = true)::numeric
      / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0) * 100, 1) as "trust_score", round(
      count(*) filter (where "position_review"."description_accurate" = true)::numeric
      / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0) * 100, 1) as "integrity_score", round(
      (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
       avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
       avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
       avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
       avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
       avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
       avg("position_review"."comp_proactive")) / 13.0 / 4.0 * 100, 1) as "growth_score", round((
      1.0 - (
         0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
             / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
         +
         0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
      )
   ) * 100, 1) as "work_life_score" from "position" inner join "company" on "company"."id" = "position"."company_id" left join "job_posting" on "job_posting"."position_id" = "position"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "position"."id", "position"."name", "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."company_review_aggregate_m_view" AS (select "company"."id", "company"."name", count(distinct "position"."id") filter (where "position_review"."id" is not null) as "positions_with_reviews", count("position_review"."id") as "total_reviews", min("position_review"."year") as "first_review_year", max("position_review"."year") as "last_review_year", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", round(avg("position_review"."rating_collaboration")::numeric, 2) as "avg_rating_collaboration", round(avg("position_review"."rating_work_variety")::numeric, 2) as "avg_rating_work_variety", round(avg("position_review"."rating_relationships")::numeric, 2) as "avg_rating_relationships", round(avg("position_review"."rating_supervisor_access")::numeric, 2) as "avg_rating_supervisor_access", round(avg("position_review"."rating_training")::numeric, 2) as "avg_rating_training", round(
               100.0 * count(*) filter (where "position_review"."would_recommend" = true)
               / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0), 1) as "pct_would_recommend", round(
               100.0 * count(*) filter (where "position_review"."description_accurate" = true)
               / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0), 1) as "pct_description_accurate", round(avg("position_review"."days_per_week")::numeric, 1) as "avg_days_per_week", round(
               100.0 * count(*) filter (where "position_review"."public_transit_available" = true)
               / nullif(count(*) filter (where "position_review"."public_transit_available" is not null), 0), 1) as "pct_public_transit", round(
               100.0 * count(*) filter (where "position_review"."overtime_required" = true)
               / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0), 1) as "pct_overtime_required", round(avg("position_review"."comp_written_comm")::numeric, 2) as "avg_comp_written_comm", round(avg("position_review"."comp_verbal_comm")::numeric, 2) as "avg_comp_verbal_comm", round(avg("position_review"."comp_comm_style")::numeric, 2) as "avg_comp_comm_style", round(avg("position_review"."comp_original_ideas")::numeric, 2) as "avg_comp_original_ideas", round(avg("position_review"."comp_problem_solving")::numeric, 2) as "avg_comp_problem_solving", round(avg("position_review"."comp_info_evaluation")::numeric, 2) as "avg_comp_info_evaluation", round(avg("position_review"."comp_data_decisions")::numeric, 2) as "avg_comp_data_decisions", round(avg("position_review"."comp_ethical_standards")::numeric, 2) as "avg_comp_ethical_standards", round(avg("position_review"."comp_technology_use")::numeric, 2) as "avg_comp_technology_use", round(avg("position_review"."comp_goal_setting")::numeric, 2) as "avg_comp_goal_setting", round(avg("position_review"."comp_diversity")::numeric, 2) as "avg_comp_diversity", round(avg("position_review"."comp_work_habits")::numeric, 2) as "avg_comp_work_habits", round(avg("position_review"."comp_proactive")::numeric, 2) as "avg_comp_proactive", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation" from "company" inner join "position" on "position"."company_id" = "company"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."position_information_m_view" AS (select "position"."id" as "position_id", "position"."name" as "position_name", "company"."id" as "company_id", "company"."name" as "company_name", max("job_posting"."year") as "most_recent_posting_year", count(distinct "position_review"."id") as "total_reviews", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", count(distinct "submission"."id") as "total_submissions", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation" from "position" inner join "company" on "company"."id" = "position"."company_id" left join "job_posting" on "job_posting"."position_id" = "position"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "position"."id", "position"."name", "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."position_omega_m_view" AS (select "position"."id" as "position_id", "position"."name" as "position_name", "company"."id" as "company_id", "company"."name" as "company_name", count("position_review"."id") as "total_reviews", round((
      0.30 * (
         (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
          avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
          avg("position_review"."rating_training")) / 5.0 / 4.0
      ) +
      0.25 * (
         count(*) filter (where "position_review"."would_recommend" = true)::numeric
         / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0)
      ) +
      0.15 * (
         count(*) filter (where "position_review"."description_accurate" = true)::numeric
         / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0)
      ) +
      0.20 * (
         (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
          avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
          avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
          avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
          avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
          avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
          avg("position_review"."comp_proactive")) / 13.0 / 4.0
      ) +
      0.10 * (
         1.0 - (
            0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
                / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
            +
            0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
         )
      )
   ) * 100, 1) as "omega_score", round(
      (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
       avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
       avg("position_review"."rating_training")) / 5.0 / 4.0 * 100, 1) as "satisfaction_score", round(
      count(*) filter (where "position_review"."would_recommend" = true)::numeric
      / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0) * 100, 1) as "trust_score", round(
      count(*) filter (where "position_review"."description_accurate" = true)::numeric
      / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0) * 100, 1) as "integrity_score", round(
      (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
       avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
       avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
       avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
       avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
       avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
       avg("position_review"."comp_proactive")) / 13.0 / 4.0 * 100, 1) as "growth_score", round((
      1.0 - (
         0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
             / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
         +
         0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
      )
   ) * 100, 1) as "work_life_score" from "position" inner join "company" on "company"."id" = "position"."company_id" left join "position_review" on "position_review"."position_id" = "position"."id" group by "position"."id", "position"."name", "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."position_review_aggregate_m_view" AS (select "position"."id" as "position_id", "position"."name" as "position_name", "company"."name" as "company_name", count("position_review"."id") as "total_reviews", min("position_review"."year") as "first_review_year", max("position_review"."year") as "last_review_year", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", round(avg("position_review"."rating_collaboration")::numeric, 2) as "avg_rating_collaboration", round(avg("position_review"."rating_work_variety")::numeric, 2) as "avg_rating_work_variety", round(avg("position_review"."rating_relationships")::numeric, 2) as "avg_rating_relationships", round(avg("position_review"."rating_supervisor_access")::numeric, 2) as "avg_rating_supervisor_access", round(avg("position_review"."rating_training")::numeric, 2) as "avg_rating_training", round(
            100.0 * count(*) filter (where "position_review"."would_recommend" = true)
            / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0), 1) as "pct_would_recommend", round(
            100.0 * count(*) filter (where "position_review"."description_accurate" = true)
            / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0), 1) as "pct_description_accurate", round(avg("position_review"."days_per_week")::numeric, 1) as "avg_days_per_week", round(
            100.0 * count(*) filter (where "position_review"."public_transit_available" = true)
            / nullif(count(*) filter (where "position_review"."public_transit_available" is not null), 0), 1) as "pct_public_transit", round(
            100.0 * count(*) filter (where "position_review"."overtime_required" = true)
            / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0), 1) as "pct_overtime_required", round(avg("position_review"."comp_written_comm")::numeric, 2) as "avg_comp_written_comm", round(avg("position_review"."comp_verbal_comm")::numeric, 2) as "avg_comp_verbal_comm", round(avg("position_review"."comp_comm_style")::numeric, 2) as "avg_comp_comm_style", round(avg("position_review"."comp_original_ideas")::numeric, 2) as "avg_comp_original_ideas", round(avg("position_review"."comp_problem_solving")::numeric, 2) as "avg_comp_problem_solving", round(avg("position_review"."comp_info_evaluation")::numeric, 2) as "avg_comp_info_evaluation", round(avg("position_review"."comp_data_decisions")::numeric, 2) as "avg_comp_data_decisions", round(avg("position_review"."comp_ethical_standards")::numeric, 2) as "avg_comp_ethical_standards", round(avg("position_review"."comp_technology_use")::numeric, 2) as "avg_comp_technology_use", round(avg("position_review"."comp_goal_setting")::numeric, 2) as "avg_comp_goal_setting", round(avg("position_review"."comp_diversity")::numeric, 2) as "avg_comp_diversity", round(avg("position_review"."comp_work_habits")::numeric, 2) as "avg_comp_work_habits", round(avg("position_review"."comp_proactive")::numeric, 2) as "avg_comp_proactive" from "position" inner join "company" on "company"."id" = "position"."company_id" left join "position_review" on "position_review"."position_id" = "position"."id" group by "position"."id", "position"."name", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."company_omega_m_view" AS (select "company"."id", "company"."name", count("position_review"."id") as "total_reviews", count(distinct "position"."id") filter (where "position_review"."id" is not null) as "positions_reviewed", count(distinct "submission"."id") as "total_submissions", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation", round((
   0.30 * (
      (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
       avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
       avg("position_review"."rating_training")) / 5.0 / 4.0
   ) +
   0.25 * (
      count(*) filter (where "position_review"."would_recommend" = true)::numeric
      / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0)
   ) +
   0.15 * (
      count(*) filter (where "position_review"."description_accurate" = true)::numeric
      / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0)
   ) +
   0.20 * (
      (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
       avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
       avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
       avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
       avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
       avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
       avg("position_review"."comp_proactive")) / 13.0 / 4.0
   ) +
   0.10 * (
      1.0 - (
         0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
             / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
         +
         0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
      )
   )
) * 100, 1) as "omega_score" from "company" inner join "position" on "position"."company_id" = "company"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."instructor_profile_m_view" AS (select "instructor"."id" as "instructor_id", "instructor"."name" as "instructor_name", "instructor"."department", "instructor"."avg_rating", "instructor"."avg_difficulty", "instructor"."num_ratings", "instructor"."rmp_id", "instructor"."rmp_legacy_id", count(distinct "section"."crn") as "total_sections_taught", count(distinct "course"."id") as "total_courses_taught", count(distinct "section"."term_id") as "total_terms_active", max("section"."term_id") as "most_recent_term", array_agg(distinct "subject"."id") as "subjects_taught", array_agg(distinct "section"."instruction_method") as "instruction_methods" from "instructor" left join "instructor_sections" on "instructor_sections"."instructor_id" = "instructor"."id" left join "section" on "section"."crn" = "instructor_sections"."section_crn" left join "course" on "course"."id" = "section"."course_id" left join "subject" on "subject"."id" = "section"."subject_code" group by "instructor"."id", "instructor"."name", "instructor"."department", "instructor"."avg_rating", "instructor"."avg_difficulty", "instructor"."num_ratings", "instructor"."rmp_id", "instructor"."rmp_legacy_id");