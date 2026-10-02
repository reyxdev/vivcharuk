-- 24 §24.6 I1: at least one ACTIVE, non-deleted Owner always exists. Deferred, so a handover
-- (remove the role from A, add it to B) in one transaction succeeds while a removal alone fails.
CREATE OR REPLACE FUNCTION assert_owner_exists() RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM "StaffRoleAssignment" sra
      JOIN "Role" r ON r.id = sra."roleId"
      JOIN "StaffUser" u ON u.id = sra."staffUserId"
      WHERE r.key = 'owner' AND u.status = 'ACTIVE' AND u."deletedAt" IS NULL) = 0
  THEN RAISE EXCEPTION 'INVARIANT_LAST_OWNER: at least one active owner must exist';
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_assert_owner_exists_user
  AFTER UPDATE OR DELETE ON "StaffUser"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION assert_owner_exists();

CREATE CONSTRAINT TRIGGER trg_assert_owner_exists_role
  AFTER DELETE ON "StaffRoleAssignment"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION assert_owner_exists();
