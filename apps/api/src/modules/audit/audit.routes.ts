import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';

/** Reading the audit log (24 §24.12): filter by actor, resource, action and date range. */
export async function auditRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  app.get('/admin/audit', { preHandler: requirePermission('audit.read') }, async (req) => {
    const q = z.object({
      actor: z.string().max(200).optional(), actorId: z.string().max(40).optional(), resourceType: z.string().max(60).optional(), resourceId: z.string().max(60).optional(),
      action: z.string().max(80).optional(), from: z.coerce.date().optional(), to: z.coerce.date().optional(),
      before: z.coerce.bigint().optional(), // cursor: rows with seq below this
    }).parse(req.query);
    const where: Prisma.AuditLogWhereInput = {
      ...(q.actor ? { actorEmail: { contains: q.actor, mode: 'insensitive' } } : {}),
      ...(q.actorId ? { actorId: q.actorId } : {}),
      ...(q.resourceType ? { resourceType: q.resourceType } : {}),
      ...(q.resourceId ? { resourceId: q.resourceId } : {}),
      ...(q.action ? { action: { startsWith: q.action } } : {}),
      ...(q.from || q.to ? { createdAt: { ...(q.from ? { gte: q.from } : {}), ...(q.to ? { lt: new Date(q.to.getTime() + 86_400_000) } : {}) } } : {}),
      ...(q.before ? { seq: { lt: q.before } } : {}),
    };
    const [rows, types, staff] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy: { seq: 'desc' }, take: 50 }),
      prisma.auditLog.groupBy({ by: ['resourceType'], _count: true, orderBy: { resourceType: 'asc' } }),
      // Round 20 #234: plain words — «Любов змінила ціну», so the log names people, not addresses.
      prisma.staffUser.findMany({ where: { deletedAt: null }, select: { id: true, firstName: true, lastName: true }, orderBy: { createdAt: 'asc' } }),
    ]);
    const nameOf = new Map(staff.map((s) => [s.id, s.firstName]));
    return {
      people: staff.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}`.trim() })),
      items: rows.map((r) => ({
        seq: r.seq.toString(), createdAt: r.createdAt.toISOString(), actorEmail: r.actorEmail, actorName: (r.actorId && nameOf.get(r.actorId)) ?? null, action: r.action, resourceType: r.resourceType,
        resourceId: r.resourceId, resourceLabel: r.resourceLabel, before: r.before, after: r.after, ipAddress: r.ipAddress,
      })),
      nextBefore: rows.length === 50 ? rows[rows.length - 1]!.seq.toString() : null,
      resourceTypes: types.map((t) => t.resourceType),
    };
  });

  // Recomputes every row's hash with the trigger's own formula (38 #62): an edited or deleted row breaks the chain.
  app.get('/admin/audit/verify', { preHandler: requirePermission('audit.read') }, async () => {
    const rows = await prisma.$queryRaw<Array<{ seq: bigint; ok: boolean }>>`
      SELECT seq, ("prevHash" IS NOT DISTINCT FROM lag(hash) OVER w) AND hash = encode(sha256(convert_to(
        coalesce(lag(hash) OVER w, '') || jsonb_build_object(
          'seq', seq, 'id', id, 'actorId', "actorId", 'actorEmail', "actorEmail", 'action', action, 'resourceType', "resourceType",
          'resourceId', "resourceId", 'resourceLabel', "resourceLabel", 'before', before, 'after', after, 'ipAddress', "ipAddress",
          'userAgent', "userAgent", 'createdAt', to_char("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))::text, 'UTF8')), 'hex') AS ok
      FROM "AuditLog" WINDOW w AS (ORDER BY seq) ORDER BY seq`;
    const broken = rows.find((r) => !r.ok);
    return { rows: rows.length, intact: !broken, firstBrokenSeq: broken ? broken.seq.toString() : null };
  });
}
