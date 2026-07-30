import { PrismaClient } from '@prisma/client';
import { copyFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRead: PrismaClient | undefined;
  sqliteReady: boolean | undefined;
};

/** On Vercel, SQLite must live under /tmp (read-only deploy FS). Seed from bundled prisma/dev.db. */
function resolveDatabaseUrl(): string | undefined {
  const configured = process.env.DATABASE_URL;
  if (!process.env.VERCEL) return configured;

  const tmpDb = '/tmp/sv-live-dev.db';
  if (!globalForPrisma.sqliteReady) {
    try {
      const here = path.dirname(fileURLToPath(import.meta.url));
      // dist/lib -> ../../prisma/dev.db  OR src/lib during tsx
      const candidates = [
        path.resolve(here, '../../prisma/dev.db'),
        path.resolve(process.cwd(), 'prisma/dev.db'),
      ];
      const seed = candidates.find((p) => existsSync(p));
      if (seed && !existsSync(tmpDb)) {
        copyFileSync(seed, tmpDb);
        logger.info(`SQLite seeded to ${tmpDb} from ${seed}`);
      }
      globalForPrisma.sqliteReady = true;
    } catch (err) {
      logger.warn(`SQLite seed copy failed: ${(err as Error).message}`);
    }
  }
  return `file:${tmpDb}`;
}

function createClient(url?: string) {
  const datasources = url ? { db: { url } } : undefined;
  return new PrismaClient({
    datasources,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

const dbUrl = resolveDatabaseUrl();

function getPrisma(): PrismaClient {
  const existing = globalForPrisma.prisma;
  // Invalidate cached client after `prisma generate` adds models (tsx keeps globalThis)
  if (existing && 'eventTheme' in existing) return existing;
  if (existing) {
    void existing.$disconnect().catch(() => undefined);
  }
  const client = createClient(dbUrl);
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrisma();

export const prismaRead =
  globalForPrisma.prismaRead && 'eventTheme' in globalForPrisma.prismaRead
    ? globalForPrisma.prismaRead
    : process.env.DATABASE_READ_URL
      ? createClient(process.env.DATABASE_READ_URL)
      : prisma;

globalForPrisma.prisma = prisma;
globalForPrisma.prismaRead = prismaRead;

if (process.env.DATABASE_READ_URL) {
  logger.info('Prisma read replica configured via DATABASE_READ_URL');
}

export const POOLING_HINT =
  'Append ?connection_limit=20&pool_timeout=10 to DATABASE_URL behind PgBouncer/ProxySQL';
