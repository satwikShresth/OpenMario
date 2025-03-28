ALTER TABLE "job_experience_levels" DROP COLUMN "id";
ALTER TABLE "job_experience_levels" ADD CONSTRAINT "job_experience_levels_job_posting_id_experience_level_pk" PRIMARY KEY("job_posting_id","experience_level");--> statement-breakpoint
