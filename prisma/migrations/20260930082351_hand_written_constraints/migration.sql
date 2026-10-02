-- Hand-written steps that Prisma cannot express in schema.prisma.
-- Sources: docs/25-database-schema.md §25.1, §25.6, §25.7, §25.10; docs/24 §24.13;
-- docs/38-security-hardening.md #61, #62.

-- ---------------------------------------------------------------------------------------------
-- 1. Review.rating CHECK (§25.6)
-- ---------------------------------------------------------------------------------------------
ALTER TABLE "Review"
  ADD CONSTRAINT "Review_rating_check" CHECK ("rating" BETWEEN 1 AND 5);

-- ---------------------------------------------------------------------------------------------
-- 2. Append-only tables (§25.1, docs/38 #61): AuditLog, StockMovement, ProductRevision,
--    PaymentTransaction. Triggers reject UPDATE, DELETE and TRUNCATE for every role.
--    Exceptions, both recorded in the docs:
--    - AuditLog: the audit_janitor role may delete (retention, docs/24 §24.13).
--    - ProductRevision: publishedAt may be set once, from NULL, with no other column changed
--      (§25.8f carries a nullable publishedAt that is filled when a revision goes live).
-- ---------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION reject_append_only_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME = 'AuditLog' AND current_user = 'audit_janitor' THEN
    IF TG_LEVEL = 'ROW' AND TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    IF TG_LEVEL = 'STATEMENT' THEN RETURN NULL; END IF;
  END IF;

  IF TG_TABLE_NAME = 'ProductRevision' AND TG_LEVEL = 'ROW' AND TG_OP = 'UPDATE' THEN
    IF OLD."publishedAt" IS NULL AND NEW."publishedAt" IS NOT NULL
       AND (to_jsonb(NEW) - 'publishedAt') = (to_jsonb(OLD) - 'publishedAt') THEN
      RETURN NEW;
    END IF;
  END IF;

  RAISE EXCEPTION '"%" is append-only: % rejected', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'restrict_violation';
END
$$;

CREATE TRIGGER "AuditLog_append_only"
  BEFORE UPDATE OR DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION reject_append_only_mutation();
CREATE TRIGGER "AuditLog_no_truncate"
  BEFORE TRUNCATE ON "AuditLog"
  FOR EACH STATEMENT EXECUTE FUNCTION reject_append_only_mutation();

CREATE TRIGGER "StockMovement_append_only"
  BEFORE UPDATE OR DELETE ON "StockMovement"
  FOR EACH ROW EXECUTE FUNCTION reject_append_only_mutation();
CREATE TRIGGER "StockMovement_no_truncate"
  BEFORE TRUNCATE ON "StockMovement"
  FOR EACH STATEMENT EXECUTE FUNCTION reject_append_only_mutation();

CREATE TRIGGER "ProductRevision_append_only"
  BEFORE UPDATE OR DELETE ON "ProductRevision"
  FOR EACH ROW EXECUTE FUNCTION reject_append_only_mutation();
CREATE TRIGGER "ProductRevision_no_truncate"
  BEFORE TRUNCATE ON "ProductRevision"
  FOR EACH STATEMENT EXECUTE FUNCTION reject_append_only_mutation();

CREATE TRIGGER "PaymentTransaction_append_only"
  BEFORE UPDATE OR DELETE ON "PaymentTransaction"
  FOR EACH ROW EXECUTE FUNCTION reject_append_only_mutation();
CREATE TRIGGER "PaymentTransaction_no_truncate"
  BEFORE TRUNCATE ON "PaymentTransaction"
  FOR EACH STATEMENT EXECUTE FUNCTION reject_append_only_mutation();

-- ---------------------------------------------------------------------------------------------
-- 3. Hash-chained audit log (docs/38 #62): each row carries the hash of the previous one.
--    The trigger owns seq/prevHash/hash; values supplied by the application are overwritten.
--    An advisory lock serialises inserts so chain order = seq order. seq is drawn AFTER the
--    lock so that concurrent transactions cannot interleave sequence values.
--    hash = sha256_hex(coalesce(prevHash,'') || jsonb_of_row::text)  (jsonb key order is
--    deterministic; createdAt is rendered in UTC with millisecond precision).
-- ---------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_log_chain() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  prev text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('AuditLog.chain'));
  NEW."seq" := nextval(pg_get_serial_sequence('"AuditLog"', 'seq'));
  SELECT "hash" INTO prev FROM "AuditLog" ORDER BY "seq" DESC LIMIT 1;
  NEW."prevHash" := prev;
  NEW."hash" := encode(sha256(convert_to(
    coalesce(prev, '') || jsonb_build_object(
      'seq',           NEW."seq",
      'id',            NEW."id",
      'actorId',       NEW."actorId",
      'actorEmail',    NEW."actorEmail",
      'action',        NEW."action",
      'resourceType',  NEW."resourceType",
      'resourceId',    NEW."resourceId",
      'resourceLabel', NEW."resourceLabel",
      'before',        NEW."before",
      'after',         NEW."after",
      'ipAddress',     NEW."ipAddress",
      'userAgent',     NEW."userAgent",
      'createdAt',     to_char(NEW."createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )::text,
    'UTF8')), 'hex');
  RETURN NEW;
END
$$;

CREATE TRIGGER "AuditLog_hash_chain"
  BEFORE INSERT ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION audit_log_chain();

-- ---------------------------------------------------------------------------------------------
-- 4. Least-privilege grants on AuditLog (§25.7, docs/24 §24.13). The roles app_rw and
--    audit_janitor are not provisioned yet; each statement runs only if its role exists, so
--    this migration succeeds on a fresh database. Re-apply these statements (or run the
--    role-provisioning script) once the roles are created.
-- ---------------------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_rw') THEN
    REVOKE UPDATE, DELETE, TRUNCATE ON "AuditLog" FROM app_rw;
    GRANT  INSERT, SELECT           ON "AuditLog" TO   app_rw;
  ELSE
    RAISE NOTICE 'role app_rw absent: AuditLog REVOKE/GRANT skipped';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'audit_janitor') THEN
    GRANT DELETE ON "AuditLog" TO audit_janitor;
  ELSE
    RAISE NOTICE 'role audit_janitor absent: AuditLog GRANT DELETE skipped';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------------------------
-- 5. Full-text search (§25.10 #1): generated tsvector on ProductTranslation with a GIN index.
--    Launch position: unaccent + the 'simple' configuration (no Ukrainian stemmer ships with
--    Postgres). unaccent() is only STABLE, so an IMMUTABLE wrapper pins the dictionary.
--    The column is declared Unsupported("tsvector")? in schema.prisma; here it is replaced by
--    the generated version.
-- ---------------------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION immutable_unaccent(text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS $$
  SELECT public.unaccent('public.unaccent'::regdictionary, $1)
$$;

DROP INDEX "ProductTranslation_searchVector_idx";
ALTER TABLE "ProductTranslation" DROP COLUMN "searchVector";
ALTER TABLE "ProductTranslation" ADD COLUMN "searchVector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('simple'::regconfig, immutable_unaccent(coalesce("name", ''))), 'A') ||
  setweight(to_tsvector('simple'::regconfig, immutable_unaccent(coalesce("description", ''))), 'B')
) STORED;
CREATE INDEX "ProductTranslation_searchVector_idx" ON "ProductTranslation" USING GIN ("searchVector");
