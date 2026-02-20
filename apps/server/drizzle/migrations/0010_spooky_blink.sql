DROP MATERIALIZED VIEW "public"."submission_m_view";--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."submission_m_view" USING "btree" WITH (fillfactor = 90) AS (select "submission"."id", "submission"."year", "submission"."coop_year", "submission"."coop_cycle", "submission"."program_level", "submission"."work_hours", "submission"."compensation", "submission"."other_compensation", "submission"."details", "submission"."owner_id", "submission"."created_at", "company"."name" as "company_name", "position"."name" as "position_name", "location"."city", "location"."state", "location"."state_code", 
          coalesce("company"."name", '')                  || ' ' ||
          coalesce("position"."name", '')                 || ' ' ||
          coalesce("location"."city", '')                 || ' ' ||
          coalesce("location"."state", '')                || ' ' ||
          coalesce("location"."state_code", '')           || ' ' ||
          coalesce("submission"."details", '')            || ' ' ||
          coalesce("submission"."other_compensation", '')
         as "search_text" from "submission" left join "position" on "submission"."position_id" = "position"."id" left join "location" on "submission"."location_id" = "location"."id" left join "company" on "position"."company_id" = "company"."id");


-- -- BM25 index for pg_search — replaces GIN FTS + trigram indexes
CREATE INDEX "submission_bm25_idx" ON "public"."submission_m_view"
USING bm25 ("id", "search_text")
WITH (key_field='id');
