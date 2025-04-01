CREATE TYPE "public"."experience_desc" AS ENUM(
  'Limited or no previous work experience/first Co-op', 
  'Some related work or volunteer experience/second Co-op', 
  'Previous related work experience/final Co-op'
);--> statement-breakpoint

ALTER TABLE "job_experience_levels" 
  ALTER COLUMN "description" 
  SET DATA TYPE experience_desc 
  USING description::experience_desc;--> statement-breakpoint

ALTER TABLE "job_experience_levels" 
  ALTER COLUMN "description" 
  SET NOT NULL;
