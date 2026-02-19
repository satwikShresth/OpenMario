-- Drop existing GIN indexes before rebuilding the view
DROP INDEX IF EXISTS "public"."submission_mview_fts_idx";
DROP INDEX IF EXISTS "public"."submission_mview_trgm_idx";

-- Rebuild materialized view with weighted tsvectors so ts_rank returns
-- meaningful relevance scores:
--   A — company name, position name  (highest signal)
--   B — city, state, state_code
--   C — details, other_compensation
--   D — program_level, coop_cycle, coop_year, year, compensation
DROP MATERIALIZED VIEW IF EXISTS "public"."submission_m_view";
--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."submission_m_view" AS (
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
    "company"."name" as "company_name",
    "position"."name" as "position_name",
    "location"."city",
    "location"."state",
    "location"."state_code",
    setweight(to_tsvector('english', coalesce("company"."name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("position"."name", '')), 'A') ||
    setweight(to_tsvector('english',
      coalesce("location"."city", '')       || ' ' ||
      coalesce("location"."state", '')      || ' ' ||
      coalesce("location"."state_code", '')
    ), 'B') ||
    setweight(to_tsvector('english',
      coalesce("submission"."details", '')            || ' ' ||
      coalesce("submission"."other_compensation", '')
    ), 'C') ||
    setweight(to_tsvector('english',
      coalesce("submission"."program_level"::text, '') || ' ' ||
      coalesce("submission"."coop_cycle"::text, '')    || ' ' ||
      coalesce("submission"."coop_year"::text, '')     || ' ' ||
      coalesce("submission"."year"::text, '')          || ' ' ||
      coalesce("submission"."compensation"::text, '')
    ), 'D') as "search_vector",
    coalesce("company"."name", '')    || ' ' ||
    coalesce("position"."name", '')   || ' ' ||
    coalesce("location"."city", '')   || ' ' ||
    coalesce("location"."state", '')  || ' ' ||
    coalesce("submission"."details", '') as "search_text"
  from "submission"
  left join "position" on "submission"."position_id" = "position"."id"
  left join "location" on "submission"."location_id" = "location"."id"
  left join "company"  on "position"."company_id"    = "company"."id"
);
--> statement-breakpoint

-- GIN index on weighted tsvector for fast full-text search
CREATE INDEX "submission_mview_fts_idx"
ON "public"."submission_m_view"
USING GIN (search_vector);
--> statement-breakpoint

-- GIN trigram index for typo-tolerant partial matching
CREATE INDEX "submission_mview_trgm_idx"
ON "public"."submission_m_view"
USING GIN (search_text gin_trgm_ops);
