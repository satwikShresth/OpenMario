CREATE SCHEMA "scheduler";
--> statement-breakpoint
CREATE SCHEMA "openmario";
--> statement-breakpoint
CREATE TYPE "scheduler"."department" AS ENUM('Accounting', 'Anthropology', 'Architecture', 'Art History', 'Biological Sciences', 'Biology', 'Business', 'Chemical Engineering', 'Chemistry', 'Communication', 'Computer Science', 'Criminal Justice', 'Culinary Arts', 'Cultural Science', 'Decision Science', 'Design', 'Digital Media', 'Economics', 'Education', 'Engineering', 'English', 'Family Studies & Social Work', 'Film', 'Finance', 'Fine Arts', 'Geology', 'Graphic Arts', 'Health Science', 'History', 'Hospitality', 'Humanities', 'Information Science', 'Japanese', 'Journalism', 'Languages', 'Law', 'Library  Information Science', 'Library & Information Science', 'Literature', 'Management', 'Marketing', 'Materials Science', 'Mathematics', 'Media Arts & Design', 'Medicine', 'Music', 'Not Specified', 'Nursing', 'Philosophy', 'Photography', 'Physics', 'Political Science', 'Psychology', 'Public Health', 'Science', 'Social Work', 'Sociology', 'Statistics', 'Student Services', 'Theater');--> statement-breakpoint
CREATE TYPE "scheduler"."instruction_method" AS ENUM('instruction', 'Community Based Learning', 'Face To Face', 'Hybrid', 'Online-Asynchronous', 'Online-Synchronous', 'Remote Asynchronous', 'Remote Synchronous');--> statement-breakpoint
CREATE TYPE "scheduler"."instruction_type" AS ENUM('instruction', 'Career Integrated Experience', 'Clinical', 'Dissertation', 'Integrated Lecture & Lab', 'Internship/Clerkship/Preceptor', 'Lab', 'Lab & Studio', 'Lecture', 'Lecture & Clinical', 'Lecture & Lab', 'Lecture, Lab & Studio', 'Lecture & Practicum', 'Lecture & Recitation', 'Lecture & Seminar', 'Lecture & Studio', 'Medical Rotation', 'Performance', 'Practice', 'Practicum', 'Practicum & Clinical', 'Private Lesson', 'Recitation/Discussion', 'Recitation & Lab', 'Research', 'Seminar', 'Seminar & Clinical', 'Seminar & Research', 'Special Topics', 'Special Topics-Lab', 'Special Topics-Lecture', 'Special Topics-Lecture & Lab', 'Special Topics-Seminar', 'Studio', 'Study Abroad', 'Thesis');--> statement-breakpoint
CREATE TYPE "openmario"."coop_cycle" AS ENUM('Fall/Winter', 'Winter/Spring', 'Spring/Summer', 'Summer/Fall');--> statement-breakpoint
CREATE TYPE "openmario"."coop_year" AS ENUM('1st', '2nd', '3rd');--> statement-breakpoint
CREATE TYPE "openmario"."program_level" AS ENUM('Undergraduate', 'Graduate');--> statement-breakpoint
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
CREATE TABLE "openmario"."company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" uuid,
	CONSTRAINT "company_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "openmario"."location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state_code" varchar(3) NOT NULL,
	"state" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	CONSTRAINT "location_state_code_state_city_unique" UNIQUE("state_code","state","city")
);
--> statement-breakpoint
CREATE TABLE "openmario"."major" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_level" "openmario"."program_level" NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "major_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "openmario"."minor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_level" "openmario"."program_level" NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "minor_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "openmario"."position" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" uuid,
	CONSTRAINT "position_company_id_name_unique" UNIQUE("company_id","name")
);
--> statement-breakpoint
CREATE TABLE "openmario"."profile_major" (
	"user_id" uuid NOT NULL,
	"major_id" uuid NOT NULL,
	CONSTRAINT "profile_major_user_id_major_id_pk" PRIMARY KEY("user_id","major_id")
);
--> statement-breakpoint
CREATE TABLE "openmario"."profile_minor" (
	"user_id" uuid NOT NULL,
	"minor_id" uuid NOT NULL,
	CONSTRAINT "profile_minor_user_id_minor_id_pk" PRIMARY KEY("user_id","minor_id")
);
--> statement-breakpoint
CREATE TABLE "openmario"."submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"program_level" "openmario"."program_level" NOT NULL,
	"work_hours" integer DEFAULT 40 NOT NULL,
	"coop_cycle" "openmario"."coop_cycle" NOT NULL,
	"coop_year" "openmario"."coop_year" NOT NULL,
	"year" integer NOT NULL,
	"compensation" double precision,
	"other_compensation" varchar(255),
	"details" varchar(255),
	"owner_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "openmario"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "scheduler"."courses" ADD CONSTRAINT "courses_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "scheduler"."subjects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler"."section_instructor" ADD CONSTRAINT "section_instructor_section_id_sections_crn_fk" FOREIGN KEY ("section_id") REFERENCES "scheduler"."sections"("crn") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler"."section_instructor" ADD CONSTRAINT "section_instructor_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "scheduler"."instructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler"."sections" ADD CONSTRAINT "sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "scheduler"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler"."subjects" ADD CONSTRAINT "subjects_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "scheduler"."colleges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openmario"."company" ADD CONSTRAINT "company_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "openmario"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openmario"."position" ADD CONSTRAINT "position_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "openmario"."company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openmario"."position" ADD CONSTRAINT "position_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "openmario"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openmario"."profile_major" ADD CONSTRAINT "profile_major_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "openmario"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openmario"."profile_major" ADD CONSTRAINT "profile_major_major_id_major_id_fk" FOREIGN KEY ("major_id") REFERENCES "openmario"."major"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openmario"."profile_minor" ADD CONSTRAINT "profile_minor_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "openmario"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openmario"."profile_minor" ADD CONSTRAINT "profile_minor_minor_id_minor_id_fk" FOREIGN KEY ("minor_id") REFERENCES "openmario"."minor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openmario"."submission" ADD CONSTRAINT "submission_position_id_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "openmario"."position"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openmario"."submission" ADD CONSTRAINT "submission_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "openmario"."location"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openmario"."submission" ADD CONSTRAINT "submission_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "openmario"."users"("id") ON DELETE set null ON UPDATE no action;
