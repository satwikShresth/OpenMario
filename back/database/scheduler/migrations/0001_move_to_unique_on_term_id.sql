ALTER TABLE "sections" DROP CONSTRAINT "sections_section_course_id_unique";--> statement-breakpoint
ALTER TABLE "sections" DROP COLUMN "enroll";--> statement-breakpoint
ALTER TABLE "sections" DROP COLUMN "max_enroll";--> statement-breakpoint
ALTER TABLE "terms" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "terms" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "terms" DROP COLUMN "end_date";--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_section_course_id_term_id_unique" UNIQUE("section","course_id","term_id");