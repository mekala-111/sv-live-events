import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

/** Stricter limiter for auth endpoints — additive, does not replace global limiter */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, try again later' },
});

export const streamJoinRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Join rate limit exceeded' },
});

export async function writeAuditLog(opts: {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  req?: Request;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: opts.userId,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId,
        meta: opts.meta ? JSON.stringify(opts.meta) : null,
        ip: opts.req?.ip,
      },
    });
  } catch (err) {
    logger.warn(`audit log failed: ${(err as Error).message}`);
  }
}

/** Fail fast in production if secrets look like defaults */
export function assertProductionSecrets() {
  if (process.env.NODE_ENV !== 'production') return;
  const bad = [
    ['JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET],
    ['JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET],
  ].filter(
    ([, v]) =>
      !v ||
      v.includes('change-in-production') ||
      v.includes('access-secret') ||
      v.length < 32,
  );
  if (bad.length) {
    const names = bad.map(([n]) => n).join(', ');
    throw new Error(`Refusing to start: weak/missing secrets (${names}). Use a secrets manager.`);
  }
}

export function securityHeadersExtra(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}
