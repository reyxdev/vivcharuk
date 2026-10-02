import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma';
import { forbidden, unauthorized } from '../lib/errors';
import { verifyAccess } from '../modules/auth/tokens';
import { resolvePermissions } from '../modules/auth/permissions';

export interface StaffContext { id: string; email: string; sessionId: string; permissions: Set<string> }

declare module 'fastify' {
  interface FastifyRequest { staff?: StaffContext }
}

// Layer 1 of 24 §24.14: the API middleware is the only real boundary.
export async function requireStaff(req: FastifyRequest, _reply: FastifyReply) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw unauthorized();
  const claims = await verifyAccess(token);
  if (!claims) throw unauthorized('TOKEN_EXPIRED');
  const session = await prisma.staffSession.findUnique({
    where: { id: claims.sid },
    select: { revokedAt: true, expiresAt: true, staffUser: { select: { id: true, email: true, status: true, permVersion: true } } },
  });
  if (!session || session.revokedAt || session.expiresAt < new Date() || session.staffUser.status !== 'ACTIVE') throw unauthorized();
  const permissions = await resolvePermissions(session.staffUser.id, session.staffUser.permVersion);
  req.staff = { id: session.staffUser.id, email: session.staffUser.email, sessionId: claims.sid, permissions };
}

export const requirePermission = (key: string) => async (req: FastifyRequest, reply: FastifyReply) => {
  if (!req.staff) await requireStaff(req, reply);
  if (!req.staff!.permissions.has(key)) throw forbidden();
};
