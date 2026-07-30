import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';
import { logger } from './logger.js';

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);

function shouldAutoSyncSchema(): boolean {
  const raw = process.env.PRISMA_AUTO_SYNC_SCHEMA?.trim().toLowerCase();
  if (!raw) return true;
  return !['0', 'false', 'no', 'off'].includes(raw);
}

export async function syncSchemaOnStartup(): Promise<void> {
  if (!shouldAutoSyncSchema()) {
    logger.info('PRISMA_AUTO_SYNC_SCHEMA disabled; skipping startup schema sync');
    return;
  }

  const prismaCliEntrypoint = require.resolve('prisma/build/index.js');
  logger.info('Synchronizing database schema with Prisma before startup');

  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [prismaCliEntrypoint, 'db', 'push', '--skip-generate'],
      {
        cwd: process.cwd(),
        env: process.env,
      },
    );

    if (stdout.trim()) logger.info(stdout.trim());
    if (stderr.trim()) logger.warn(stderr.trim());
    logger.info('Prisma schema sync completed');
  } catch (error) {
    const err = error as Error & { stdout?: string; stderr?: string };
    if (err.stdout?.trim()) logger.error(err.stdout.trim());
    if (err.stderr?.trim()) logger.error(err.stderr.trim());
    throw new Error(`Prisma schema sync failed: ${err.message}`);
  }
}
