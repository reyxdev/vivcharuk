// docs/24 §24.16: system roles are upserted by key with isSystem = true. A role created now gets
// its full permission set; an existing role only gains permissions introduced in this run, so a
// deliberate Owner adjustment (§24.6 I4) is never undone by a deploy. Custom roles are untouched.
import type { Prisma } from '@prisma/client';
import { SYSTEM_ROLES, type PermissionKey } from '../../packages/schemas/src/permissions';

export async function syncRoles(db: Prisma.TransactionClient, newKeys: ReadonlySet<PermissionKey>) {
  const permIds = new Map(
    (await db.permission.findMany({ select: { id: true, key: true } })).map((p) => [p.key, p.id]),
  );

  const summary: Array<{ key: string; created: boolean; added: number }> = [];

  for (const [key, spec] of Object.entries(SYSTEM_ROLES)) {
    const existing = await db.role.findUnique({ where: { key } });
    const role = existing
      ? await db.role.update({ where: { key }, data: { isSystem: true } })
      : await db.role.create({
          data: { key, name: spec.name, description: spec.description, isSystem: true },
        });

    const keys: readonly PermissionKey[] = existing
      ? spec.permissions.filter((k) => newKeys.has(k))
      : spec.permissions;

    const { count } = await db.rolePermission.createMany({
      data: keys.map((k) => {
        const permissionId = permIds.get(k);
        if (!permissionId) throw new Error(`Role ${key}: permission ${k} missing from the table`);
        return { roleId: role.id, permissionId };
      }),
      skipDuplicates: true,
    });

    summary.push({ key, created: !existing, added: count });
  }

  return summary;
}
