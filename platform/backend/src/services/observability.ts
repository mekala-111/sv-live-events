import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const incoming = String(req.headers['x-correlation-id'] || req.headers['x-request-id'] || '');
  const id = incoming || randomUUID();
  req.correlationId = id;
  res.setHeader('X-Correlation-Id', id);
  next();
}

export function structuredLog(level: 'info' | 'warn' | 'error', message: string, fields?: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    service: 'svlive-api',
    ...fields,
  };
  if (level === 'error') logger.error(JSON.stringify(payload));
  else if (level === 'warn') logger.warn(JSON.stringify(payload));
  else logger.info(JSON.stringify(payload));
}

/** Minimal OTel-compatible span stub (wire @opentelemetry/sdk-node in prod) */
export function startSpan(name: string, attrs?: Record<string, string>) {
  const start = Date.now();
  const traceId = randomUUID().replace(/-/g, '').slice(0, 32);
  const spanId = randomUUID().replace(/-/g, '').slice(0, 16);
  return {
    traceId,
    spanId,
    name,
    attrs: attrs || {},
    end(status: 'ok' | 'error' = 'ok') {
      structuredLog(status === 'ok' ? 'info' : 'error', `span:${name}`, {
        traceId,
        spanId,
        durationMs: Date.now() - start,
        status,
        ...attrs,
      });
    },
  };
}
