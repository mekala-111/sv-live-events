import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      include: { author: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: blogs });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: param(req.params.slug) },
      include: { author: { select: { name: true, avatar: true } } },
    });

    if (!blog || !blog.isPublished) {
      throw new AppError('Blog not found', 404);
    }

    res.json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
});

export default router;
