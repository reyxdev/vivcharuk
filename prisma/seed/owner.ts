// One Owner at launch: Іван (round 8 §L1; docs/24 §24.16). Runs only when no Owner exists, so a
// re-run on a live system can never mint a privileged account or touch an existing password.
// The login address is external and never published on the site (round 8; CLAUDE.md).
import { randomInt } from 'node:crypto';
import argon2 from 'argon2';
import type { PrismaClient } from '@prisma/client';

const OWNER = {
  email: 'gif19601@gmail.com',
  firstName: 'Іван',
  lastName: 'Гондурак', // docs/24 §24.16 SEED_OWNERS
} as const;

// Routing default from §24.16 / round 5 §H3: the quote queue points at Іван until Любов's
// account exists. Changeable with settings.update; the seed never overwrites it.
const QUOTE_ASSIGNEE_SETTING = 'orders.quote.default_assignee_id';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

function oneTimePassword(length = 20): string {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

export async function seedOwner(db: PrismaClient): Promise<void> {
  const ownerRole = await db.role.findUniqueOrThrow({ where: { key: 'owner' } });
  const owners = await db.staffRoleAssignment.count({ where: { roleId: ownerRole.id } });
  if (owners > 0) {
    console.log(`owner: ${owners} Owner account(s) already exist, skipped`);
    return;
  }

  if (await db.staffUser.findUnique({ where: { email: OWNER.email } })) {
    throw new Error(
      `owner: ${OWNER.email} exists without the Owner role. Resolve by hand; the seed never promotes an existing account.`,
    );
  }

  const password = oneTimePassword();
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  await db.$transaction(async (tx) => {
    const user = await tx.staffUser.create({
      data: {
        ...OWNER,
        passwordHash,
        passwordChangedAt: null, // must rotate on first login (docs/25 §25.11)
        status: 'ACTIVE',
        // twoFactor* left null: TOTP enrolment is forced at first login (round 8 §L14).
      },
    });
    await tx.staffRoleAssignment.create({ data: { staffUserId: user.id, roleId: ownerRole.id } });
    await tx.setting.upsert({
      where: { key: QUOTE_ASSIGNEE_SETTING },
      create: { key: QUOTE_ASSIGNEE_SETTING, value: user.id },
      update: {},
    });
  });

  console.log(`ONE-TIME OWNER PASSWORD for ${OWNER.email} (shown once, not stored): ${password}`);
}
