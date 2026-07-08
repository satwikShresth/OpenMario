DO $$
DECLARE
  idx record;
BEGIN
  FOR idx IN
    SELECT schemaname, indexname
    FROM pg_indexes
    WHERE tablename = 'submissions_m_view'
      AND indexdef ILIKE '%bm25%'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I.%I', idx.schemaname, idx.indexname);
  END LOOP;
END $$;--> statement-breakpoint
DROP EXTENSION IF EXISTS pg_search CASCADE;--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS "public"."submissions_m_view";--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."submissions_m_view" WITH (fillfactor = 90) AS (
  select
    "submission"."id",
    "submission"."year",
    "submission"."coop_year",
    "submission"."coop_cycle",
    "submission"."program_level",
    "submission"."work_hours",
    "submission"."compensation",
    "submission"."other_compensation",
    "submission"."details",
    "submission"."owner_id",
    "submission"."created_at",
    "company"."id" as "company_id",
    "position"."id" as "position_id",
    "company"."name" as "company_name",
    "position"."name" as "position_name",
    "location"."city" as "city",
    "location"."state" as "state",
    "location"."state_code" as "state_code"
  from "submission"
  left join "position" on "submission"."position_id" = "position"."id"
  left join "location" on "submission"."location_id" = "location"."id"
  left join "company" on "position"."company_id" = "company"."id"
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "submissions_m_view_id_idx" ON "public"."submissions_m_view" ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "submissions_m_view_year_program_idx" ON "public"."submissions_m_view" ("year", "program_level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "submissions_m_view_compensation_idx" ON "public"."submissions_m_view" ("compensation");
