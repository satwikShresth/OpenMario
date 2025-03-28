ALTER TABLE "terms" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "terms" CASCADE;--> statement-breakpoint
ALTER TABLE "sections" RENAME COLUMN "term_id" TO "term";--> statement-breakpoint
ALTER TABLE "sections" DROP CONSTRAINT "sections_section_course_id_term_id_unique";--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_section_course_id_term_unique" UNIQUE("section","course_id","term");
