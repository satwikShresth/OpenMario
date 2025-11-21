CREATE SCHEMA "scheduler";
--> statement-breakpoint
CREATE TYPE "scheduler"."department" AS ENUM('Accounting', 'Anthropology', 'Architecture', 'Art History', 'Biological Sciences', 'Biology', 'Business', 'Chemical Engineering', 'Chemistry', 'Communication', 'Computer Science', 'Criminal Justice', 'Culinary Arts', 'Cultural Science', 'Decision Science', 'Design', 'Digital Media', 'Economics', 'Education', 'Engineering', 'English', 'Family Studies & Social Work', 'Film', 'Finance', 'Fine Arts', 'Geology', 'Graphic Arts', 'Health Science', 'History', 'Hospitality', 'Humanities', 'Information Science', 'Japanese', 'Journalism', 'Languages', 'Law', 'Library  Information Science', 'Library & Information Science', 'Literature', 'Management', 'Marketing', 'Dance', 'Materials Science', 'Mathematics', 'Media Arts & Design', 'Medicine', 'Music', 'Not Specified', 'Nursing', 'Philosophy', 'Photography', 'Physics', 'Political Science', 'Psychology', 'Public Health', 'Science', 'Social Work', 'Sociology', 'Statistics', 'Student Services', 'Theater');--> statement-breakpoint
CREATE TYPE "scheduler"."instruction_method" AS ENUM('instruction', 'Community Based Learning', 'Face To Face', 'Hybrid', 'Online-Asynchronous', 'Online-Synchronous', 'Remote Asynchronous', 'Remote Synchronous');--> statement-breakpoint
CREATE TYPE "scheduler"."instruction_type" AS ENUM('instruction', 'Career Integrated Experience', 'Clinical', 'Dissertation', 'Integrated Lecture & Lab', 'Internship/Clerkship/Preceptor', 'Lab', 'Lab & Studio', 'Lecture', 'Lecture & Clinical', 'Lecture & Lab', 'Lecture, Lab & Studio', 'Lecture & Practicum', 'Lecture & Recitation', 'Lecture & Seminar', 'Lecture & Studio', 'Medical Rotation', 'Performance', 'Practice', 'Practicum', 'Practicum & Clinical', 'Private Lesson', 'Recitation/Discussion', 'Recitation & Lab', 'Research', 'Seminar', 'Seminar & Clinical', 'Seminar & Research', 'Special Topics', 'Special Topics-Lab', 'Special Topics-Lecture', 'Special Topics-Lecture & Lab', 'Special Topics-Seminar', 'Studio', 'Study Abroad', 'Thesis');--> statement-breakpoint
CREATE TYPE "public"."citizenship_restriction" AS ENUM('No Restriction', 'Resident Alien (Green Card) or US Citizen', 'US Citizen Only');--> statement-breakpoint
CREATE TYPE "public"."compensation_status" AS ENUM('Unpaid Position', 'Hourly Paid or Salaried Position');--> statement-breakpoint
CREATE TYPE "public"."experience_desc" AS ENUM('Limited or no previous work experience/first Co-op', 'Some related work or volunteer experience/second Co-op', 'Previous related work experience/final Co-op');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('Advanced', 'Beginner', 'Intermediate');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('Inactive', 'Pending', 'Cancelled', 'Active', 'Delete');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('Co-op Experience', 'Graduate Co-op Experience', 'Summer-Only Coop');--> statement-breakpoint
CREATE TABLE "scheduler"."colleges" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "colleges_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "scheduler"."courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" text NOT NULL,
	"course_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"credits" double precision DEFAULT 0,
	"credit_range" text,
	"repeat_status" text,
	"prerequisites" text,
	"corequisites" text,
	"restrictions" text,
	"writing_intensive" boolean DEFAULT false,
	CONSTRAINT "courses_subject_id_course_number_unique" UNIQUE("subject_id","course_number")
);
--> statement-breakpoint
CREATE TABLE "scheduler"."instructors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avg_difficulty" double precision,
	"avg_rating" double precision,
	"num_ratings" integer,
	"rmp_legacy_id" integer,
	"rmp_id" text,
	"department" "scheduler"."department",
	CONSTRAINT "instructors_rmp_legacy_id_unique" UNIQUE("rmp_legacy_id"),
	CONSTRAINT "instructors_rmp_id_unique" UNIQUE("rmp_id")
);
--> statement-breakpoint
CREATE TABLE "scheduler"."section_instructor" (
	"section_id" integer NOT NULL,
	"instructor_id" integer NOT NULL,
	CONSTRAINT "section_instructor_section_id_instructor_id_pk" PRIMARY KEY("section_id","instructor_id")
);
--> statement-breakpoint
CREATE TABLE "scheduler"."sections" (
	"crn" integer PRIMARY KEY NOT NULL,
	"course_id" uuid NOT NULL,
	"section" text NOT NULL,
	"instruction_type" "scheduler"."instruction_type" NOT NULL,
	"instruction_method" "scheduler"."instruction_method" NOT NULL,
	"credits" double precision,
	"start_time" time,
	"end_time" time,
	"days" integer[],
	"term" integer,
	CONSTRAINT "sections_section_course_id_term_instruction_type_unique" UNIQUE("section","course_id","term","instruction_type")
);
--> statement-breakpoint
CREATE TABLE "scheduler"."subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"college_id" text NOT NULL,
	CONSTRAINT "subjects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "job_experience_levels" (
	"job_posting_id" uuid NOT NULL,
	"experience_level" "experience_level" NOT NULL,
	"description" "experience_desc" NOT NULL,
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
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "job_posting_position_id_location_id_year_citizenship_restriction_minimum_gpa_travel_required_unique" UNIQUE NULLS NOT DISTINCT("position_id","location_id","year","citizenship_restriction","minimum_gpa","travel_required")
);
--> statement-breakpoint
CREATE TABLE "job_posting_major" (
	"job_posting_id" uuid NOT NULL,
	"major_id" uuid NOT NULL,
	CONSTRAINT "job_posting_major_job_posting_id_major_id_pk" PRIMARY KEY("job_posting_id","major_id")
);
--> statement-breakpoint
ALTER TABLE "scheduler"."courses" ADD CONSTRAINT "courses_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "scheduler"."subjects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler"."section_instructor" ADD CONSTRAINT "section_instructor_section_id_sections_crn_fk" FOREIGN KEY ("section_id") REFERENCES "scheduler"."sections"("crn") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler"."section_instructor" ADD CONSTRAINT "section_instructor_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "scheduler"."instructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler"."sections" ADD CONSTRAINT "sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "scheduler"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler"."subjects" ADD CONSTRAINT "subjects_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "scheduler"."colleges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_experience_levels" ADD CONSTRAINT "job_experience_levels_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_position_id_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."position"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting_major" ADD CONSTRAINT "job_posting_major_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting_major" ADD CONSTRAINT "job_posting_major_major_id_major_id_fk" FOREIGN KEY ("major_id") REFERENCES "public"."major"("id") ON DELETE cascade ON UPDATE no action;
