import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { param } from '../utils/params.js';

const router = Router();

const testimonialSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  company: z.string().optional(),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5).optional(),
  avatar: z.url().optional(),
  videoUrl: z.url().optional(),
  isFeatured: z.boolean().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: testimonials });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireRole('ADMIN'), validate(testimonialSchema), async (req, res, next) => {
  try {
    const testimonial = await prisma.testimonial.create({ data: req.body });
    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN'), validate(testimonialSchema.partial()), async (req, res, next) => {
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id: param(req.params.id) },
      data: req.body,
    });
    res.json({ success: true, data: testimonial });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await prisma.testimonial.delete({ where: { id: param(req.params.id) } });
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
