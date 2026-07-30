import { createRequire } from 'module';
import { logger } from './logger.js';

const require = createRequire(import.meta.url);
const REDIS_URL = process.env.REDIS_URL ?? '';

interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: unknown[]): Promise<'OK'>;
  del(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  on(event: string, listener: (...args: unknown[]) => void): void;
}

class NoOpRedis implements RedisLike {
  on(_event: string, _listener: (...args: unknown[]) => void): void {}

  async get(_key: string): Promise<string | null> {
    return null;
  }

  async set(_key: string, _value: string, ..._args: unknown[]): Promise<'OK'> {
    return 'OK';
  }

  async del(_key: string): Promise<number> {
    return 0;
  }

  async expire(_key: string, _seconds: number): Promise<number> {
    return 0;
  }
}

let redis: RedisLike;

if (REDIS_URL) {
  const IORedis = require('ioredis') as new (url: string) => RedisLike;
  const client = new IORedis(REDIS_URL);
  client.on('connect', () => logger.info('Redis connected'));
  client.on('error', (...args: unknown[]) => logger.error(`Redis error: ${(args[0] as Error).message}`));
  redis = client;
} else {
  logger.info('REDIS_URL not set — using no-op redis');
  redis = new NoOpRedis();
}

export { redis };
