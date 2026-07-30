import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';

const router = Router();

const gallerySchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  mediaType: z.enum(['image', 'video']),
  mediaUrl: z.url(),
  thumbnail: z.url().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const items = await prisma.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireRole('ADMIN'), validate(gallerySchema), async (req, res, next) => {
  try {
    const item = await prisma.galleryItem.create({ data: req.body });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN'), validate(gallerySchema.partial()), async (req, res, next) => {
  try {
    const item = await prisma.galleryItem.update({
      where: { id: param(req.params.id) },
      data: req.body,
    });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await prisma.galleryItem.delete({ where: { id: param(req.params.id) } });
    res.json({ success: true, message: 'Gallery item deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
