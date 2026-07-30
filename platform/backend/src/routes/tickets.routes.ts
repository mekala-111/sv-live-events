import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';

const router = Router();

const createTicketSchema = z.object({
  subject: z.string().min(3),
  description: z.string().min(10),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

router.post('/', requireAuth, validate(createTicketSchema), async (req, res, next) => {
  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user!.userId,
        subject: req.body.subject,
        description: req.body.description,
        priority: req.body.priority ?? 'medium',
      },
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'STAFF';
    const tickets = await prisma.supportTicket.findMany({
      where: isAdmin ? {} : { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: param(req.params.id) } });
    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'STAFF';
    if (!isAdmin && ticket.userId !== req.user!.userId) {
      throw new AppError('Access denied', 403);
    }
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
});

export default router;
