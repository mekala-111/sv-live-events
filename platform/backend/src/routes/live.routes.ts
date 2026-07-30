import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { comparePassword } from '../utils/password.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';

const router = Router();

const accessSchema = z.object({
  streamKey: z.string().min(1),
  password: z.string().min(1),
});

const chatSchema = z.object({
  sender: z.string().min(1),
  message: z.string().min(1).max(500),
  emoji: z.string().optional(),
});

router.post('/access', validate(accessSchema), async (req, res, next) => {
  try {
    const { streamKey, password } = req.body;

    const liveEvent = await prisma.liveEvent.findUnique({
      where: { streamKey },
      include: {
        booking: {
          include: { package: true },
        },
      },
    });

    if (!liveEvent) {
      throw new AppError('Live event not found', 404);
    }

    if (liveEvent.passwordHash) {
      const valid = await comparePassword(password, liveEvent.passwordHash);
      if (!valid) {
        throw new AppError('Invalid stream password', 401);
      }
    }

    res.json({
      success: true,
      data: {
        id: liveEvent.id,
        title: liveEvent.title,
        streamKey: liveEvent.streamKey,
        embedUrl: liveEvent.embedUrl,
        isLive: liveEvent.isLive,
        viewerCount: liveEvent.viewerCount,
        booking: {
          id: liveEvent.booking.id,
          bookingCode: liveEvent.booking.bookingCode,
          eventTitle: liveEvent.booking.eventTitle,
          eventDate: liveEvent.booking.eventDate,
          package: liveEvent.booking.package,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:bookingId/chat', async (req, res, next) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { bookingId: param(req.params.bookingId) },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
});

router.post('/:bookingId/chat', validate(chatSchema), async (req, res, next) => {
  try {
    const bookingId = param(req.params.bookingId);
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const message = await prisma.chatMessage.create({
      data: {
        bookingId,
        sender: req.body.sender,
        message: req.body.message,
        emoji: req.body.emoji,
      },
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
});

export default router;
