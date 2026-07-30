import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const services = await prisma.extraService.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
});

export default router;
