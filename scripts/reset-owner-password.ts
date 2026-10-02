// Give the Owner a new one-time password from the server's command line (2026-10-02). The panel password
// is never read from .env: the seed prints one once (prisma/seed/owner.ts), and this replaces it when it
// was lost. Only another Owner can reset an Owner in the panel, and at launch there is one.
//   npx tsx --env-file=.env scripts/reset-owner-password.ts
// Prints the new password once (not stored). It must be changed at the next login; the lock after failed
// attempts is cleared and every open session of the Owner is ended. The Authenticator setup is kept.
import { randomInt } from 'node:crypto';
import argon2 from 'argon2';
import { prisma } from '../apps/api/src/lib/prisma';
import { audit } from '../apps/api/src/modules/audit/audit.service';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
const password = Array.from({ length: 20 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
const passwordHash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });

const owner = await prisma.staffUser.findFirstOrThrow({
  where: { status: 'ACTIVE', deletedAt: null, roles: { some: { role: { key: 'owner' } } } },
  select: { id: true, email: true },
});
await prisma.$transaction(async (tx) => {
  await tx.staffUser.update({
    where: { id: owner.id },
    data: { passwordHash, passwordChangedAt: null, failedLoginCount: 0, lockedUntil: null },
  });
  await tx.staffSession.deleteMany({ where: { staffUserId: owner.id } });
  await audit({ actorId: owner.id, actorEmail: owner.email, action: 'employee.password_reset_cli', resourceType: 'StaffUser', resourceId: owner.id, resourceLabel: owner.email }, tx);
});
console.log(`\nНовий одноразовий пароль власника ${owner.email} (показується один раз, ніде не зберігається):\n  ${password}\n`);
await prisma.$disconnect();
