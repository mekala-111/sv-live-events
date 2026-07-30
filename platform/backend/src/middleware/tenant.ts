import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

/** Resolve tenant from Host header / X-Tenant-Slug without breaking single-tenant demos */
export async function resolveTenant(req: Request, _res: Response, next: NextFunction) {
  try {
    const slug = String(req.headers['x-tenant-slug'] || '').trim();
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];

    if (slug) {
      const t = await prisma.tenant.findUnique({ where: { slug } });
      if (t?.isActive) req.tenantId = t.id;
    } else if (host && host !== 'localhost' && !host.startsWith('127.')) {
      const t = await prisma.tenant.findFirst({
        where: { OR: [{ customDomain: host }, { slug: host.split('.')[0] }] },
      });
      if (t?.isActive) req.tenantId = t.id;
    }
    next();
  } catch {
    next();
  }
}
