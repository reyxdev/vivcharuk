// docs/24 §24.16: the catalogue constant is the source; the Permission table is a projection.
import type { Prisma } from '@prisma/client';
import { PERMISSIONS, type PermissionKey } from '../../packages/schemas/src/permissions';

/** Upserts every catalogue permission. Returns the keys that did not exist before this run. */
export async function syncPermissions(db: Prisma.TransactionClient): Promise<Set<PermissionKey>> {
  const before = new Set((await db.permission.findMany({ select: { key: true } })).map((p) => p.key));

  for (const p of PERMISSIONS) {
    const data = { key: p.key, resource: p.resource, action: p.action, isDangerous: p.dangerous };
    await db.permission.upsert({ where: { key: p.key }, create: data, update: data });
  }

  // Report, never silently delete: removing a permission is a decision, not a side effect.
  const orphans = await db.permission.findMany({
    where: { key: { notIn: PERMISSIONS.map((p) => p.key) } },
    select: { key: true },
  });
  if (orphans.length) {
    throw new Error(
      `ORPHAN_PERMISSIONS: ${orphans.map((o) => o.key).join(', ')}. ` +
        'Remove the RolePermission and StaffPermissionGrant rows in an explicit migration first.',
    );
  }

  return new Set(PERMISSIONS.map((p) => p.key).filter((k) => !before.has(k)));
}
