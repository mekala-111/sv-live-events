import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import { verifyPlaybackToken } from '../utils/streaming.js';

const router = Router();

const pollSchema = z.object({
  question: z.string().min(3),
  options: z.array(z.string().min(1)).min(2).max(6),
});

router.get('/:slug/polls', async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({ where: { slug: param(req.params.slug) } });
    if (!stream) throw new AppError('Stream not found', 404);
    const polls = await prisma.livePoll.findMany({
      where: { streamId: stream.id },
      include: { votes: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json({
      success: true,
      data: polls.map((p) => ({
        id: p.id,
        question: p.question,
        options: JSON.parse(p.optionsJson) as string[],
        isOpen: p.isOpen,
        tallies: (JSON.parse(p.optionsJson) as string[]).map((_, i) => p.votes.filter((v) => v.optionIdx === i).length),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/:streamId/polls',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'),
  validate(pollSchema),
  async (req, res, next) => {
    try {
      const poll = await prisma.livePoll.create({
        data: {
          streamId: param(req.params.streamId),
          question: req.body.question,
          optionsJson: JSON.stringify(req.body.options),
        },
      });
      res.status(201).json({ success: true, data: poll });
    } catch (err) {
      next(err);
    }
  },
);

router.post('/polls/:id/vote', async (req, res, next) => {
  try {
    const optionIdx = Number(req.body?.optionIdx);
    const voterKey = String(req.body?.voterKey || req.ip || 'anon');
    if (!Number.isInteger(optionIdx) || optionIdx < 0) throw new AppError('Invalid option', 400);
    const vote = await prisma.livePollVote.upsert({
      where: { pollId_voterKey: { pollId: param(req.params.id), voterKey } },
      create: { pollId: param(req.params.id), voterKey, optionIdx },
      update: { optionIdx },
    });
    res.json({ success: true, data: vote });
  } catch (err) {
    next(err);
  }
});

router.post('/:slug/react', async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({ where: { slug: param(req.params.slug) } });
    if (!stream) throw new AppError('Stream not found', 404);
    const emoji = String(req.body?.emoji || '❤️').slice(0, 8);
    const reaction = await prisma.liveReaction.create({
      data: {
        streamId: stream.id,
        emoji,
        sender: req.body?.sender,
        count: Number(req.body?.count || 1),
      },
    });
    res.status(201).json({ success: true, data: reaction });
  } catch (err) {
    next(err);
  }
});

router.post('/:slug/gift', async (req, res, next) => {
  try {
    const decoded = req.body?.playbackToken ? verifyPlaybackToken(req.body.playbackToken) : null;
    const stream = await prisma.stream.findUnique({ where: { slug: param(req.params.slug) } });
    if (!stream) throw new AppError('Stream not found', 404);
    if (decoded && decoded.streamId !== stream.id) throw new AppError('Invalid session', 401);

    const gift = await prisma.virtualGift.create({
      data: {
        streamId: stream.id,
        sender: String(req.body?.sender || 'Guest'),
        giftCode: String(req.body?.giftCode || 'flower'),
        amountInr: Number(req.body?.amountInr || 0),
      },
    });
    res.status(201).json({ success: true, data: gift });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug/badges', async (req, res, next) => {
  try {
    const badges = await prisma.viewerBadge.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: badges });
  } catch (err) {
    next(err);
  }
});

router.post('/badges', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const badge = await prisma.viewerBadge.create({
      data: {
        streamId: req.body.streamId,
        nickname: String(req.body.nickname),
        level: String(req.body.level || 'MEMBER'),
      },
    });
    res.status(201).json({ success: true, data: badge });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug/audio-tracks', async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({ where: { slug: param(req.params.slug) } });
    if (!stream) throw new AppError('Stream not found', 404);
    let tracks = await prisma.audioTrack.findMany({ where: { streamId: stream.id } });
    if (tracks.length === 0) {
      tracks = [
        await prisma.audioTrack.create({
          data: { streamId: stream.id, language: 'original', label: 'Original', isDefault: true },
        }),
      ];
    }
    res.json({ success: true, data: tracks });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug/subtitles', async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({ where: { slug: param(req.params.slug) } });
    if (!stream) throw new AppError('Stream not found', 404);
    const tracks = await prisma.subtitleTrack.findMany({ where: { streamId: stream.id } });
    res.json({ success: true, data: tracks });
  } catch (err) {
    next(err);
  }
});

export default router;
