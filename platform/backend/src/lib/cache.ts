import { redis } from './redis.js';
import { logger } from './logger.js';

/** Logical Redis namespaces — keep keys isolated for scale / flush safety */
export const CacheNs = {
  SESSION: 'sess',
  PLAYBACK: 'pb',
  VIEWERS: 'viewers',
  CHAT: 'chat',
  ANALYTICS: 'an',
  RATE: 'rl',
  EDGE: 'edge',
} as const;

export type CacheNamespace = (typeof CacheNs)[keyof typeof CacheNs];

/** Default TTLs (seconds) */
export const CacheTtl = {
  SESSION: 60 * 60 * 8,
  PLAYBACK: 60 * 30,
  VIEWERS: 5,
  CHAT: 30,
  ANALYTICS: 60,
  RATE: 60 * 15,
  EDGE: 30,
  WARM: 60 * 5,
} as const;

function k(ns: CacheNamespace, key: string) {
  return `svlive:${ns}:${key}`;
}

export async function cacheGet(ns: CacheNamespace, key: string): Promise<string | null> {
  try {
    return await redis.get(k(ns, key));
  } catch {
    return null;
  }
}

export async function cacheSet(
  ns: CacheNamespace,
  key: string,
  value: string,
  ttlSec: number,
): Promise<void> {
  try {
    await redis.set(k(ns, key), value, 'EX', ttlSec);
  } catch (err) {
    logger.warn(`cacheSet failed: ${(err as Error).message}`);
  }
}

export async function cacheGetJson<T>(ns: CacheNamespace, key: string): Promise<T | null> {
  const raw = await cacheGet(ns, key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSetJson(
  ns: CacheNamespace,
  key: string,
  value: unknown,
  ttlSec: number,
): Promise<void> {
  await cacheSet(ns, key, JSON.stringify(value), ttlSec);
}

export async function cacheDel(ns: CacheNamespace, key: string): Promise<void> {
  try {
    await redis.del(k(ns, key));
  } catch {
    /* ignore */
  }
}

/** Warm frequently read keys after deploy / scale-up */
export async function warmCaches(slugs: string[]): Promise<void> {
  for (const slug of slugs) {
    await cacheSet(CacheNs.EDGE, `warm:${slug}`, '1', CacheTtl.WARM);
  }
  logger.info(`Cache warming queued for ${slugs.length} streams`);
}
