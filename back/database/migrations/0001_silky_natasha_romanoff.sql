-- Custom SQL migration file, put your code below! --
-- Adding pg_trgm extention for efficient string matching --
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
