-- Custom SQL migration file, put your code below! --
CREATE EXTENSION IF NOT EXISTS pg_search;
-- --> statement-breakpoint
--
-- Drop legacy GIN indexes (FTS tsvector + trigram) — replaced by BM25
DROP INDEX IF EXISTS "public"."submission_mview_fts_idx";
DROP INDEX IF EXISTS "public"."submission_mview_trgm_idx";
--> statement-breakpoint


-- -- BM25 index for pg_search — replaces GIN FTS + trigram indexes
-- CREATE INDEX "submission_bm25_idx" ON "public"."submission_m_view"
-- USING bm25 ("id", "search_text")
-- WITH (key_field='id');
