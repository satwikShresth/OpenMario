CREATE TABLE "job_posting_major" (
	"job_posting_id" uuid NOT NULL,
	"major_id" uuid NOT NULL,
	CONSTRAINT "job_posting_major_job_posting_id_major_id_pk" PRIMARY KEY("job_posting_id","major_id")
);
--> statement-breakpoint
ALTER TABLE "job_posting" RENAME COLUMN "hours_per_week" TO "work_hours";--> statement-breakpoint
ALTER TABLE "job_posting" RENAME COLUMN "has_hazardous_materials" TO "exposure_hazardous_materials";--> statement-breakpoint
ALTER TABLE "job_posting" RENAME COLUMN "compensation_other" TO "other_compensation";--> statement-breakpoint
ALTER TABLE "job_posting_major" ADD CONSTRAINT "job_posting_major_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting_major" ADD CONSTRAINT "job_posting_major_major_id_major_id_fk" FOREIGN KEY ("major_id") REFERENCES "public"."major"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" DROP COLUMN "external_employer_id";--> statement-breakpoint
ALTER TABLE "job_posting" DROP COLUMN "external_position_id";--> statement-breakpoint
ALTER TABLE "job_posting" DROP COLUMN "majors_sought";