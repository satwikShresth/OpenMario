DROP TABLE "scheduler"."colleges" CASCADE;--> statement-breakpoint
DROP TABLE "scheduler"."courses" CASCADE;--> statement-breakpoint
DROP TABLE "scheduler"."instructors" CASCADE;--> statement-breakpoint
DROP TABLE "scheduler"."section_instructor" CASCADE;--> statement-breakpoint
DROP TABLE "scheduler"."sections" CASCADE;--> statement-breakpoint
DROP TABLE "scheduler"."subjects" CASCADE;--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."submission_m_view" AS (select "submission"."id", "submission"."year", "submission"."coop_year", "submission"."coop_cycle", "submission"."program_level", "submission"."work_hours", "submission"."compensation", "submission"."other_compensation", "submission"."details", "submission"."owner_id", "submission"."created_at", "company"."name" as "company_name", "position"."name" as "position_name", "location"."city", "location"."state", "location"."state_code", 
               to_tsvector('english',
                  coalesce("company"."name", '')                  || ' ' ||
                  coalesce("position"."name", '')                 || ' ' ||
                  coalesce("location"."city", '')                 || ' ' ||
                  coalesce("location"."state", '')                || ' ' ||
                  coalesce("location"."state_code", '')           || ' ' ||
                  coalesce("submission"."details", '')            || ' ' ||
                  coalesce("submission"."other_compensation", '') || ' ' ||
                  coalesce("submission"."program_level"::text, '') || ' ' ||
                  coalesce("submission"."coop_cycle"::text, '')   || ' ' ||
                  coalesce("submission"."coop_year"::text, '')    || ' ' ||
                  coalesce("submission"."year"::text, '')         || ' ' ||
                  coalesce("submission"."compensation"::text, '')
               )
             as "search_vector", 
               coalesce("company"."name", '')                  || ' ' ||
               coalesce("position"."name", '')                 || ' ' ||
               coalesce("location"."city", '')                 || ' ' ||
               coalesce("location"."state", '')                || ' ' ||
               coalesce("submission"."details", '')
             as "search_text" from "submission" left join "position" on "submission"."position_id" = "position"."id" left join "location" on "submission"."location_id" = "location"."id" left join "company" on "position"."company_id" = "company"."id");
DROP TYPE "scheduler"."department";--> statement-breakpoint
DROP TYPE "scheduler"."instruction_method";--> statement-breakpoint
DROP TYPE "scheduler"."instruction_type";--> statement-breakpoint
DROP SCHEMA "scheduler";

-- GIN trigram index for typo-tolerant search
CREATE INDEX submission_mview_trgm_idx
ON "public"."submission_m_view"
USING GIN (search_text gin_trgm_ops);

-- GIN index on tsvector for fast exact search
CREATE INDEX submission_mview_fts_idx
ON "public"."submission_m_view"
USING GIN (search_vector);
