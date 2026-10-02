-- Round 10 part 3 #24: typo correction in site search by trigram similarity over product names.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "ProductTranslation_name_trgm" ON "ProductTranslation" USING gin (lower(name) gin_trgm_ops);
