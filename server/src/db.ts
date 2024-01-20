import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

export * from '@prisma/client';
