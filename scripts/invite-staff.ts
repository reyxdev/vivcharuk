// Invite a staff member from the command line, acting as the owner — for the developer's own account
// (2026-10-02, D23) before anyone can open the panel on a fresh server.
//   npx tsx --env-file=.env scripts/invite-staff.ts <email> <first name> <last name> <role key, e.g. tech>
// Prints the one-time invitation link (also e-mailed when site mail is configured). The person sets
// their own password and Authenticator through it; nothing secret is chosen here.
import { prisma } from '../apps/api/src/lib/prisma';
import { invite } from '../apps/api/src/modules/employees/employees.service';
import { resolvePermissions } from '../apps/api/src/modules/auth/permissions';

const [email, firstName, lastName, role] = process.argv.slice(2);
if (!email || !firstName || !lastName || !role) throw new Error('usage: invite-staff.ts <email> <first name> <last name> <role key>');
const owner = await prisma.staffUser.findFirstOrThrow({ where: { status: 'ACTIVE', roles: { some: { role: { key: 'owner' } } } }, select: { id: true, email: true, permVersion: true } });
const r = await invite({ email, firstName, lastName, roleKeys: [role] }, { id: owner.id, email: owner.email, permissions: await resolvePermissions(owner.id, owner.permVersion) });
console.log(`Запрошення створено. Посилання (одноразове, діє 72 год):\n${r.link}`);
await prisma.$disconnect();
