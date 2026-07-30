import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRead: PrismaClient | undefined;
};

function createClient(url?: string) {
  const datasources = url ? { db: { url } } : undefined;
  return new PrismaClient({
    datasources,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl?.startsWith('mysql://') && !dbUrl?.startsWith('mysql2://')) {
  throw new Error('DATABASE_URL must be a MySQL connection string, for example mysql://user:password@host:3306/database');
}

export const prisma = globalForPrisma.prisma ?? createClient(dbUrl);

export const prismaRead =
  globalForPrisma.prismaRead ??
  (process.env.DATABASE_READ_URL ? createClient(process.env.DATABASE_READ_URL) : prisma);

globalForPrisma.prisma = prisma;
globalForPrisma.prismaRead = prismaRead;

if (process.env.DATABASE_READ_URL) {
  logger.info('Prisma read replica configured via DATABASE_READ_URL');
}

export const POOLING_HINT =
  'Append ?connection_limit=20&pool_timeout=10 to DATABASE_URL behind PgBouncer/ProxySQL';
