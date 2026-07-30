import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';

const router = Router();

const packageSchema = z.object({
  name: z.string().min(1),
  tier: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  cameras: z.number().int().positive().optional(),
  durationHours: z.number().int().positive().optional(),
  features: z.union([z.string(), z.array(z.string())]),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: packages });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const pkg = await prisma.package.findUnique({ where: { slug: param(req.params.slug) } });
    if (!pkg || !pkg.isActive) {
      throw new AppError('Package not found', 404);
    }
    res.json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireRole('ADMIN'), validate(packageSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const features =
      typeof data.features === 'string' ? data.features : JSON.stringify(data.features);

    const pkg = await prisma.package.create({
      data: { ...data, features },
    });
    res.status(201).json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN'), validate(packageSchema.partial()), async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.features !== undefined) {
      data.features =
        typeof data.features === 'string' ? data.features : JSON.stringify(data.features);
    }

    const pkg = await prisma.package.update({
      where: { id: param(req.params.id) },
      data,
    });
    res.json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await prisma.package.update({
      where: { id: param(req.params.id) },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Package deactivated' });
  } catch (err) {
    next(err);
  }
});

export default router;
