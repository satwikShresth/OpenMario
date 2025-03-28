ALTER TABLE "sections"
ALTER COLUMN "days" SET DATA TYPE integer[] USING days::integer[];
