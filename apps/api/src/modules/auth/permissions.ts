import { prisma } from '../../lib/prisma';

// DENY wins over any ALLOW; grants and roles are resolved per request from a short cache keyed by
// staffUserId + permVersion, so a revoked permission takes effect immediately (24 §24.1, §24.15).
const cache = new Map<string, { version: number; keys: Set<string>; at: number }>();
const TTL_MS = 30_000;

export async function resolvePermissions(staffUserId: string, permVersion: number) {
  const hit = cache.get(staffUserId);
  if (hit && hit.version === permVersion && Date.now() - hit.at < TTL_MS) return hit.keys;
  const now = new Date();
  const [roles, grants] = await Promise.all([
    prisma.staffRoleAssignment.findMany({
      where: { staffUserId },
      select: { role: { select: { permissions: { select: { permission: { select: { key: true } } } } } } },
    }),
    prisma.staffPermissionGrant.findMany({
      where: { staffUserId, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      select: { effect: true, permission: { select: { key: true } } },
    }),
  ]);
  const keys = new Set<string>();
  for (const r of roles) for (const p of r.role.permissions) keys.add(p.permission.key);
  for (const g of grants) if (g.effect === 'ALLOW') keys.add(g.permission.key);
  for (const g of grants) if (g.effect === 'DENY') keys.delete(g.permission.key);
  cache.set(staffUserId, { version: permVersion, keys, at: Date.now() });
  return keys;
}

export const invalidatePermissions = (staffUserId: string) => cache.delete(staffUserId);
