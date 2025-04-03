ALTER TABLE "job_posting" DROP CONSTRAINT "job_posting_position_id_location_id_year_citizenship_restriction_minimum_gpa_travel_required_unique";--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_position_id_location_id_year_citizenship_restriction_minimum_gpa_travel_required_unique" UNIQUE NULLS NOT DISTINCT("position_id","location_id","year","citizenship_restriction","minimum_gpa","travel_required");
ALTER TYPE "scheduler"."department" ADD VALUE 'Dance' BEFORE 'Materials Science';
