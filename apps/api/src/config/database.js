// apps/api/src/config/database.js

import { PrismaClient } from '@prisma/client';

/**
 * Prisma database client singleton.
 * Creates a single instance and reuses it across the application
 * to prevent connection pool exhaustion.
 */
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;