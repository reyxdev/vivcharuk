import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export interface AuditEntry {
  actorId: string | null;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  resourceLabel?: string | null;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}

// Append-only and hash-chained in the database: a BEFORE INSERT trigger fills seq, prevHash and
// hash, and UPDATE/DELETE are rejected (38 #61, #62). The app only inserts.
export function audit(entry: AuditEntry, tx?: Prisma.TransactionClient) {
  return (tx ?? prisma).auditLog.create({ data: entry });
}
