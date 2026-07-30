import { Router } from 'express';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import { notifyEvent } from '../utils/notify.js';

const router = Router();
const tokenId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 24);

const createSchema = z.object({
  streamId: z.string().min(1),
  guests: z
    .array(
      z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        channel: z.enum(['EMAIL', 'SMS', 'WHATSAPP']).default('EMAIL'),
      }),
    )
    .min(1),
});

router.get('/stream/:streamId', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const invites = await prisma.guestInvitation.findMany({
      where: { streamId: param(req.params.streamId) },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: invites });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), validate(createSchema), async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({ where: { id: req.body.streamId } });
    if (!stream) throw new AppError('Stream not found', 404);

    const client = process.env.CLIENT_URL || 'http://localhost:5173';
    const created = [];

    for (const g of req.body.guests as Array<{
      name: string;
      email?: string;
      phone?: string;
      channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
    }>) {
      const token = tokenId();
      const link = `${client}/live/${stream.slug}?invite=${token}`;
      const invite = await prisma.guestInvitation.create({
        data: {
          streamId: stream.id,
          tenantId: stream.tenantId,
          name: g.name,
          email: g.email,
          phone: g.phone,
          channel: g.channel,
          token,
          status: 'SENT',
          sentAt: new Date(),
          qrPayload: link,
        },
      });
      await notifyEvent({
        type: 'EVENT_REMINDER',
        to: {
          email: g.channel === 'EMAIL' ? g.email : undefined,
          phone: g.channel === 'SMS' ? g.phone : undefined,
          whatsapp: g.channel === 'WHATSAPP' ? g.phone : undefined,
        },
        subject: `You're invited: ${stream.title}`,
        message: `Secure link: ${link}`,
        meta: { inviteId: invite.id, channel: g.channel },
      });
      created.push({ ...invite, link });
    }

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

router.get('/redeem/:token', async (req, res, next) => {
  try {
    const invite = await prisma.guestInvitation.findUnique({
      where: { token: param(req.params.token) },
      include: { stream: { select: { slug: true, title: true, status: true, eventType: true } } },
    });
    if (!invite) throw new AppError('Invitation not found', 404);
    if (!invite.openedAt) {
      await prisma.guestInvitation.update({
        where: { id: invite.id },
        data: { status: 'OPENED', openedAt: new Date() },
      });
    }
    res.json({
      success: true,
      data: {
        name: invite.name,
        status: invite.status,
        stream: invite.stream,
        link: invite.qrPayload,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/joined', async (req, res, next) => {
  try {
    const invite = await prisma.guestInvitation.update({
      where: { id: param(req.params.id) },
      data: { status: 'JOINED', joinedAt: new Date() },
    });
    res.json({ success: true, data: invite });
  } catch (err) {
    next(err);
  }
});

export default router;
