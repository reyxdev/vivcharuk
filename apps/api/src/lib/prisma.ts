import { PrismaClient } from '@prisma/client';

// The only module besides repositories allowed to import Prisma (27 §27.6).
export const prisma = new PrismaClient();
