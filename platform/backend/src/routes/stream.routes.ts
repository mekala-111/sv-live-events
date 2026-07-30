import { Router } from 'express';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';
import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import {
  buildStreamCredentials,
  hashIp,
  signPlaybackToken,
  verifyPlaybackToken,
} from '../utils/streaming.js';
import {
  computeLifecycle,
  filterProfanity,
  isGifUrl,
  regenerateStreamKey,
  signHlsUrl,
} from '../utils/streamLifecycle.js';
import os from 'os';
import fs from 'fs';
import { logger } from '../lib/logger.js';
import { notifyEvent } from '../utils/notify.js';
import { CacheNs, CacheTtl, cacheGetJson, cacheSetJson } from '../lib/cache.js';
import { streamJoinRateLimiter } from '../middleware/securityHardening.js';
import { prismaRead } from '../lib/prisma.js';
import { isYouTubeEvent, parseWebsiteConfig } from '../utils/youtube.js';

const router = Router();
const sessionId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 24);

const createSchema = z.object({
  title: z.string().min(3),
  eventType: z.string().min(2),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  isRecording: z.boolean().optional(),
  bookingId: z.string().optional(),
  password: z.string().min(4).optional(),
  slowModeSec: z.number().int().min(0).max(120).optional(),
  /** Optional custom guest slug (domain name). Letters/numbers only. */
  slug: z
    .string()
    .min(3)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z0-9]+$/, 'Invalid slug')
    .optional(),
});

const verifySchema = z.object({
  password: z.string().min(1),
  displayName: z.string().optional(),
  device: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  networkSpeed: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

const chatSchema = z.object({
  sender: z.string().min(1),
  message: z.string().min(1).max(500),
  emoji: z.string().optional(),
  gifUrl: z.string().url().optional(),
  playbackToken: z.string().min(1),
});

const scheduleSchema = z.object({
  scheduledAt: z.string().datetime().nullable(),
});

const muteSchema = z.object({
  nickname: z.string().min(1),
  reason: z.string().optional(),
  banned: z.boolean().optional(),
});

const pinSchema = z.object({
  message: z.string().min(1).max(280),
});

/** Admin: create live event (V1 = YouTube website; still stores stream row for PIN + guest URL) */
router.post('/events', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), validate(createSchema), async (req, res, next) => {
  try {
    const { title, eventType, description, scheduledAt, isRecording, bookingId, password, slowModeSec, slug: customSlug } = req.body;
    const creds = buildStreamCredentials(title);
    const plainPassword = password || creds.password;
    const passwordHash = await hashPassword(plainPassword);
    const website = parseWebsiteConfig(description);
    const youtubeMode = isYouTubeEvent(website);

    let slug = customSlug || website?.domainName || creds.slug;
    slug = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 48) || creds.slug;

    const existing = await prisma.stream.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Domain / slug already in use. Choose another.', 409);
    }

    const stream = await prisma.stream.create({
      data: {
        title,
        slug,
        eventType,
        description,
        rtmpUrl: creds.rtmpUrl,
        streamKey: creds.streamKey,
        hlsUrl: creds.hlsUrl,
        webrtcUrl: creds.webrtcUrl,
        passwordHash,
        publisherToken: creds.publisherToken,
        isRecording: youtubeMode ? false : (isRecording ?? true),
        slowModeSec: slowModeSec ?? 0,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        bookingId,
        createdById: req.user!.userId,
        // V1 YouTube: guest page is ready; playback is on YouTube
        status: youtubeMode ? 'LIVE' : scheduledAt ? 'SCHEDULED' : 'WAITING',
        startedAt: youtubeMode ? new Date() : null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.userId,
        action: 'STREAM_CREATED',
        entity: 'Stream',
        entityId: stream.id,
        meta: JSON.stringify({
          slug: stream.slug,
          service: website?.service || (youtubeMode ? 'youtube' : 'svlive'),
          youtubeLiveUrl: website?.youtubeLiveUrl || null,
        }),
      },
    });

    const viewerBase = process.env.CLIENT_URL || 'http://localhost:5173';

    res.status(201).json({
      success: true,
      data: {
        ...stream,
        password: plainPassword,
        viewerUrl: `${viewerBase}/live/${stream.slug}`,
        service: website?.service || (youtubeMode ? 'youtube' : 'svlive'),
        youtubeLiveUrl: website?.youtubeLiveUrl || null,
        youtubeLiveKey: website?.youtubeLiveKey || null,
        obs: youtubeMode
          ? {
              server: 'rtmp://a.rtmp.youtube.com/live2',
              streamKey: website?.youtubeLiveKey || '(set in YouTube Studio)',
              notes: 'V1: Stream from OBS to YouTube using the YouTube Live Key. Guests watch via the event page embed.',
            }
          : {
              server: creds.rtmpUrl,
              streamKey: creds.streamKey,
              publisherToken: creds.publisherToken,
              notes: creds.password,
            },
      },
    });
  } catch (err) {
    next(err);
  }
});

/** Admin: list streams */
router.get('/events', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (_req, res, next) => {
  try {
    const streams = await prisma.stream.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { sessions: true, messages: true, recordings: true } },
        recordings: { take: 3, orderBy: { createdAt: 'desc' } },
      },
    });
    res.json({ success: true, data: streams });
  } catch (err) {
    next(err);
  }
});

/** Admin: get one */
router.get('/events/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({
      where: { id: param(req.params.id) },
    });
    if (!stream) throw new AppError('Stream not found', 404);
    const viewerBase = process.env.CLIENT_URL || 'http://localhost:5173';
    res.json({
      success: true,
      data: {
        ...stream,
        viewerUrl: `${viewerBase}/live/${stream.slug}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  eventType: z.string().min(2).optional(),
  slug: z
    .string()
    .min(3)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z0-9]+$/, 'Invalid slug')
    .optional(),
  scheduledAt: z.union([z.string().datetime(), z.null()]).optional(),
  isRecording: z.boolean().optional(),
  password: z.string().min(4).optional(),
  publish: z.boolean().optional(),
  /** Full event-portal form; stored under description.portal */
  portal: z.record(z.string(), z.any()).optional(),
});

/** Admin: update stream + optional portal config JSON */
router.patch('/events/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), validate(updateSchema), async (req, res, next) => {
  try {
    const id = param(req.params.id);
    const existing = await prisma.stream.findUnique({ where: { id } });
    if (!existing) throw new AppError('Stream not found', 404);

    const body = req.body as z.infer<typeof updateSchema>;
    const prev = (parseWebsiteConfig(existing.description) || {}) as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    if (body.title) data.title = body.title;
    if (body.eventType) data.eventType = body.eventType;
    if (body.isRecording !== undefined) data.isRecording = body.isRecording;
    if (body.scheduledAt !== undefined) {
      data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    }

    if (body.slug && body.slug !== existing.slug) {
      const clash = await prisma.stream.findUnique({ where: { slug: body.slug } });
      if (clash) throw new AppError('Slug already in use', 409);
      data.slug = body.slug;
    }

    if (body.password) {
      data.passwordHash = await hashPassword(body.password);
    }

    if (body.portal) {
      const portal = body.portal;
      const merged = {
        ...prev,
        portal,
        service: 'youtube',
        designId: (portal.websiteDesignId as string) || (portal.themeId as string) || prev.designId,
        designName: (portal.websiteDesignId as string) || (portal.themeId as string) || prev.designName,
        liveTimings: (portal.liveTimings as string) || prev.liveTimings,
        domainName: (portal.slug as string) || prev.domainName,
        youtubeChannel: (portal.youtubeChannel as string) || prev.youtubeChannel,
        youtubeLiveUrl: (portal.youtubeLiveUrl as string) || prev.youtubeLiveUrl,
        youtubeLiveKey: (portal.youtubeLiveKey as string) || prev.youtubeLiveKey,
        teaserUrl: (portal.teaserUrl as string) || prev.teaserUrl,
        scrollMessage: (portal.scrollMessage as string) || prev.scrollMessage,
        watchLiveButton: portal.watchLiveButton ?? prev.watchLiveButton,
        socialShare: portal.socialShare ?? prev.socialShare,
        whatsappNumber: (portal.whatsappNumber as string) || prev.whatsappNumber,
        remarks1: (portal.remarks1 as string) || prev.remarks1,
        remarks2: (portal.remarks2 as string) || prev.remarks2,
        fontStyle: (portal.fontStyle as string) || prev.fontStyle,
        fontColor: (portal.fontColor as string) || prev.fontColor,
      };
      data.description = JSON.stringify(merged);
    }

    if (body.publish) {
      const descStr = (data.description as string) || existing.description;
      const website = parseWebsiteConfig(descStr);
      if (isYouTubeEvent(website)) {
        data.status = 'LIVE';
        if (!existing.startedAt) data.startedAt = new Date();
      } else if (body.scheduledAt || existing.scheduledAt) {
        data.status = 'SCHEDULED';
      } else {
        data.status = 'WAITING';
      }
    }

    const stream = await prisma.stream.update({
      where: { id },
      data: data as Parameters<typeof prisma.stream.update>[0]['data'],
    });
    const viewerBase = process.env.CLIENT_URL || 'http://localhost:5173';
    res.json({
      success: true,
      data: {
        ...stream,
        viewerUrl: `${viewerBase}/live/${stream.slug}`,
      },
    });
  } catch (err) {
    const prismaErr = err as { code?: string; meta?: { target?: string }; message?: string };
    if (prismaErr.code === 'P2000' || /Data too long|too long/i.test(prismaErr.message || '')) {
      return next(new AppError('Event data too large to save. Use smaller images.', 400));
    }
    next(err);
  }
});

router.post('/events/:id/start', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const stream = await prisma.stream.update({
      where: { id: param(req.params.id) },
      data: {
        status: 'LIVE',
        startedAt: new Date(),
        endedAt: null,
        pausedAt: null,
        ingestActive: true,
        lastHeartbeatAt: new Date(),
      },
    });
    await notifyEvent({
      type: 'STREAM_STARTED',
      to: { email: process.env.SMTP_FROM },
      subject: `Live now: ${stream.title}`,
      message: `Stream ${stream.slug} is live.`,
    });
    res.json({ success: true, data: { ...stream, lifecycle: computeLifecycle(stream) } });
  } catch (err) {
    next(err);
  }
});

router.post('/events/:id/pause', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const stream = await prisma.stream.update({
      where: { id: param(req.params.id) },
      data: { status: 'PAUSED', pausedAt: new Date(), ingestActive: false },
    });
    res.json({ success: true, data: { ...stream, lifecycle: computeLifecycle(stream) } });
  } catch (err) {
    next(err);
  }
});

router.post('/events/:id/resume', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const stream = await prisma.stream.update({
      where: { id: param(req.params.id) },
      data: { status: 'LIVE', pausedAt: null, ingestActive: true, lastHeartbeatAt: new Date() },
    });
    res.json({ success: true, data: { ...stream, lifecycle: computeLifecycle(stream) } });
  } catch (err) {
    next(err);
  }
});

router.post('/events/:id/regenerate-key', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const id = param(req.params.id);
    const existing = await prisma.stream.findUnique({ where: { id } });
    if (!existing) throw new AppError('Stream not found', 404);
    if (existing.status === 'LIVE' && existing.ingestActive) {
      throw new AppError('Stop or pause the live ingest before regenerating the key', 400);
    }

    const streamKey = regenerateStreamKey(existing.slug.replace(/-/g, '_'));
    const hlsBase = process.env.HLS_BASE_URL || 'http://localhost:8080/live';
    const webrtcBase = process.env.WEBRTC_BASE_URL || 'webrtc://localhost:1985/live';
    const publisherToken = `pub_${sessionId()}`;

    const stream = await prisma.stream.update({
      where: { id },
      data: {
        streamKey,
        hlsUrl: `${hlsBase}/${streamKey}.m3u8`,
        webrtcUrl: `${webrtcBase}/${streamKey}`,
        publisherToken,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.userId,
        action: 'STREAM_KEY_REGENERATED',
        entity: 'Stream',
        entityId: id,
        meta: JSON.stringify({ streamKey }),
      },
    });

    res.json({
      success: true,
      data: {
        ...stream,
        obs: { server: stream.rtmpUrl, streamKey: stream.streamKey, publisherToken },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/events/:id/schedule', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), validate(scheduleSchema), async (req, res, next) => {
  try {
    const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    const stream = await prisma.stream.update({
      where: { id: param(req.params.id) },
      data: {
        scheduledAt,
        status: scheduledAt ? 'SCHEDULED' : 'WAITING',
      },
    });
    res.json({ success: true, data: { ...stream, lifecycle: computeLifecycle(stream) } });
  } catch (err) {
    next(err);
  }
});

router.post('/events/:id/pin', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), validate(pinSchema), async (req, res, next) => {
  try {
    const stream = await prisma.stream.update({
      where: { id: param(req.params.id) },
      data: { pinnedMessage: req.body.message },
    });
    res.json({ success: true, data: stream });
  } catch (err) {
    next(err);
  }
});

router.post('/events/:id/mute', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), validate(muteSchema), async (req, res, next) => {
  try {
    const streamId = param(req.params.id);
    const mute = await prisma.streamMute.create({
      data: {
        streamId,
        nickname: req.body.nickname,
        reason: req.body.reason,
        banned: req.body.banned ?? false,
      },
    });
    res.status(201).json({ success: true, data: mute });
  } catch (err) {
    next(err);
  }
});

router.post('/events/:id/slow-mode', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const slowModeSec = Number(req.body?.seconds ?? 0);
    const stream = await prisma.stream.update({
      where: { id: param(req.params.id) },
      data: { slowModeSec: Math.max(0, Math.min(120, slowModeSec)) },
    });
    res.json({ success: true, data: stream });
  } catch (err) {
    next(err);
  }
});

router.post('/events/:id/stop', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const id = param(req.params.id);
    const existing = await prisma.stream.findUnique({ where: { id } });
    if (!existing) throw new AppError('Stream not found', 404);

    const stream = await prisma.stream.update({
      where: { id },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
        currentViewers: 0,
        ingestActive: false,
        pausedAt: null,
      },
    });

    if (existing.isRecording) {
      const recording = await prisma.recording.create({
        data: {
          streamId: id,
          title: `${existing.title} — Recording`,
          fileUrl: existing.hlsUrl || `https://recordings.svliveevents.com/${existing.streamKey}.mp4`,
          thumbnail: existing.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
          previewUrl: existing.hlsUrl,
          durationSec: existing.startedAt
            ? Math.max(60, Math.floor((Date.now() - existing.startedAt.getTime()) / 1000))
            : 3600,
          fileSizeMb: 850,
          shareToken: sessionId(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      });
      await notifyEvent({
        type: 'RECORDING_READY',
        to: { email: process.env.SMTP_FROM },
        subject: `Recording ready: ${existing.title}`,
        message: `Recording ${recording.id} is ready.`,
      });
    }

    res.json({ success: true, data: { ...stream, lifecycle: computeLifecycle(stream) } });
  } catch (err) {
    next(err);
  }
});

router.delete('/events/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    await prisma.stream.delete({ where: { id: param(req.params.id) } });
    res.json({ success: true, message: 'Stream deleted' });
  } catch (err) {
    next(err);
  }
});

/** Public: stream status by slug (lifecycle + countdown) */
router.get('/status/:slug', async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({
      where: { slug: param(req.params.slug) },
      select: {
        id: true,
        title: true,
        slug: true,
        eventType: true,
        status: true,
        description: true,
        currentViewers: true,
        peakViewers: true,
        thumbnail: true,
        scheduledAt: true,
        startedAt: true,
        endedAt: true,
        pausedAt: true,
        ingestActive: true,
        lastHeartbeatAt: true,
        isRecording: true,
        pinnedMessage: true,
        slowModeSec: true,
      },
    });
    if (!stream) throw new AppError('Stream not found', 404);
    const website = parseWebsiteConfig(stream.description);
    const youtubeMode = isYouTubeEvent(website);
    const lifecycle = youtubeMode && stream.status !== 'ENDED' && stream.status !== 'ARCHIVED'
      ? 'LIVE'
      : computeLifecycle(stream);
    const countdownMs = stream.scheduledAt
      ? Math.max(0, stream.scheduledAt.getTime() - Date.now())
      : null;
    const { description: _desc, ...safe } = stream;
    res.json({
      success: true,
      data: {
        ...safe,
        lifecycle,
        countdownMs,
        service: website?.service || (youtubeMode ? 'youtube' : 'svlive'),
        youtubeLiveUrl: website?.youtubeLiveUrl || null,
        teaserUrl: website?.teaserUrl || null,
        liveTimings: website?.liveTimings || null,
        scrollMessage: website?.scrollMessage || null,
        watchLiveButton: website?.watchLiveButton !== false,
        socialShare: website?.socialShare !== false,
        whatsappNumber: website?.whatsappNumber || null,
        designId: website?.designId || null,
        designName: website?.designName || null,
        fontColor: website?.fontColor || null,
        screens: {
          waiting: !youtubeMode && (lifecycle === 'WAITING' || lifecycle === 'SCHEDULED'),
          startingSoon: !youtubeMode && lifecycle === 'STARTING_SOON',
          live: lifecycle === 'LIVE' || youtubeMode,
          paused: !youtubeMode && lifecycle === 'PAUSED',
          offline: !youtubeMode && lifecycle === 'OFFLINE',
          ended: lifecycle === 'ENDED' || lifecycle === 'ARCHIVED',
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/** SRS callbacks — OBS publish / unpublish */
router.post('/hooks/on-publish', async (req, res, next) => {
  try {
    const streamKey = String(req.body?.stream || req.body?.streamKey || '');
    const token = String(req.body?.param || req.query?.token || '');
    if (!streamKey) throw new AppError('stream key required', 400);

    const stream = await prisma.stream.findUnique({ where: { streamKey } });
    if (!stream) {
      logger.warn(`SRS on_publish rejected unknown key: ${streamKey}`);
      return res.status(403).json({ code: 1, msg: 'invalid stream key' });
    }
    if (stream.publisherToken && token && token !== stream.publisherToken) {
      logger.warn(`SRS on_publish hijack attempt on ${stream.slug}`);
      return res.status(403).json({ code: 1, msg: 'invalid publisher token' });
    }
    if (stream.status === 'ENDED' || stream.status === 'ARCHIVED') {
      return res.status(403).json({ code: 1, msg: 'stream ended' });
    }

    const updated = await prisma.stream.update({
      where: { id: stream.id },
      data: {
        status: 'LIVE',
        ingestActive: true,
        startedAt: stream.startedAt || new Date(),
        pausedAt: null,
        lastHeartbeatAt: new Date(),
      },
    });
    await notifyEvent({
      type: 'STREAM_STARTED',
      to: { email: process.env.SMTP_FROM },
      subject: `Live now: ${updated.title}`,
      message: `Ingest started for ${updated.slug}`,
    });
    res.json({ code: 0, msg: 'ok' });
  } catch (err) {
    next(err);
  }
});

router.post('/hooks/on-unpublish', async (req, res, next) => {
  try {
    const streamKey = String(req.body?.stream || req.body?.streamKey || '');
    const stream = await prisma.stream.findUnique({ where: { streamKey } });
    if (stream && stream.status === 'LIVE') {
      await prisma.stream.update({
        where: { id: stream.id },
        data: { ingestActive: false, lastHeartbeatAt: new Date(), status: 'OFFLINE' },
      });
    }
    res.json({ code: 0, msg: 'ok' });
  } catch (err) {
    next(err);
  }
});

router.post('/hooks/heartbeat', async (req, res, next) => {
  try {
    const streamKey = String(req.body?.stream || req.body?.streamKey || '');
    const stream = await prisma.stream.findUnique({ where: { streamKey } });
    if (stream) {
      await prisma.stream.update({
        where: { id: stream.id },
        data: { lastHeartbeatAt: new Date(), ingestActive: true },
      });
    }
    res.json({ code: 0 });
  } catch (err) {
    next(err);
  }
});

/** Viewer: verify password → JWT playback token + signed HLS */
router.post('/verify-password/:slug', streamJoinRateLimiter, validate(verifySchema), async (req, res, next) => {
  try {
    const slug = param(req.params.slug);
    const stream = await prisma.stream.findUnique({ where: { slug } });
    if (!stream) throw new AppError('Stream not found', 404);

    const valid = await comparePassword(req.body.password, stream.passwordHash);
    if (!valid) throw new AppError('Invalid stream password', 401);

    const website = parseWebsiteConfig(stream.description);
    const youtubeMode = isYouTubeEvent(website);
    const lifecycle =
      youtubeMode && stream.status !== 'ENDED' && stream.status !== 'ARCHIVED'
        ? 'LIVE'
        : computeLifecycle(stream);
    const token = sessionId();
    const ip = hashIp(req.ip);
    const prior = await prisma.viewerSession.findFirst({
      where: { streamId: stream.id, ipHash: ip || undefined },
    });

    const session = await prisma.viewerSession.create({
      data: {
        streamId: stream.id,
        sessionToken: token,
        displayName: req.body.displayName || 'Guest',
        device: req.body.device,
        browser: req.body.browser,
        os: req.body.os,
        networkSpeed: req.body.networkSpeed,
        country: req.body.country || 'IN',
        city: req.body.city,
        ipHash: ip,
        isReturning: Boolean(prior),
      },
    });

    await prisma.stream.update({
      where: { id: stream.id },
      data: {
        currentViewers: { increment: 1 },
        totalJoins: { increment: 1 },
        peakViewers: Math.max(stream.peakViewers, stream.currentViewers + 1),
      },
    });

    await prisma.streamAnalytic.create({
      data: {
        streamId: stream.id,
        metric: 'join',
        value: 1,
        dimension: 'device',
        dimensionValue: req.body.device || 'unknown',
      },
    });

    const playbackToken = signPlaybackToken({
      streamId: stream.id,
      slug: stream.slug,
      sessionToken: token,
    });

    const demoHls =
      process.env.DEMO_HLS_URL ||
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

    const rawHls =
      lifecycle === 'LIVE' && stream.hlsUrl && stream.ingestActive
        ? stream.hlsUrl
        : lifecycle === 'LIVE' && stream.hlsUrl
          ? stream.hlsUrl
          : demoHls;

    const signedHls = youtubeMode ? '' : signHlsUrl(rawHls, stream.id, token);
    const countdownMs = stream.scheduledAt
      ? Math.max(0, stream.scheduledAt.getTime() - Date.now())
      : null;

    res.json({
      success: true,
      data: {
        playbackToken,
        sessionId: session.id,
        watermark: req.body.displayName || 'Guest',
        stream: {
          id: stream.id,
          title: stream.title,
          slug: stream.slug,
          status: stream.status,
          lifecycle,
          countdownMs,
          isLive: lifecycle === 'LIVE' || youtubeMode,
          currentViewers: stream.currentViewers + 1,
          peakViewers: Math.max(stream.peakViewers, stream.currentViewers + 1),
          hlsUrl: signedHls,
          webrtcUrl: stream.webrtcUrl,
          pinnedMessage: stream.pinnedMessage,
          eventType: stream.eventType,
          slowModeSec: stream.slowModeSec,
          allowGifs: stream.allowGifs,
          scheduledAt: stream.scheduledAt,
          service: website?.service || (youtubeMode ? 'youtube' : 'svlive'),
          youtubeLiveUrl: website?.youtubeLiveUrl || null,
          teaserUrl: website?.teaserUrl || null,
          liveTimings: website?.liveTimings || null,
          scrollMessage: website?.scrollMessage || null,
          watchLiveButton: website?.watchLiveButton !== false,
          socialShare: website?.socialShare !== false,
          whatsappNumber: website?.whatsappNumber || null,
          designId: website?.designId || null,
          designName: website?.designName || null,
          fontColor: website?.fontColor || null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/viewer/leave', async (req, res, next) => {
  try {
    const { playbackToken } = req.body as { playbackToken?: string };
    if (!playbackToken) throw new AppError('playbackToken required', 400);
    const decoded = verifyPlaybackToken(playbackToken);
    if (!decoded) throw new AppError('Invalid playback token', 401);

    const session = await prisma.viewerSession.findUnique({
      where: { sessionToken: decoded.sessionToken },
    });
    if (session && !session.leftAt) {
      const watchSeconds = Math.floor((Date.now() - session.joinedAt.getTime()) / 1000);
      await prisma.viewerSession.update({
        where: { id: session.id },
        data: { leftAt: new Date(), watchSeconds },
      });
      await prisma.stream.update({
        where: { id: decoded.streamId },
        data: { currentViewers: { decrement: 1 } },
      });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/viewer/count/:slug', async (req, res, next) => {
  try {
    const slug = param(req.params.slug);
    const cached = await cacheGetJson<{ currentViewers: number; peakViewers: number; status: string }>(
      CacheNs.VIEWERS,
      slug,
    );
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }
    const stream = await prismaRead.stream.findUnique({
      where: { slug },
      select: { currentViewers: true, peakViewers: true, status: true },
    });
    if (!stream) throw new AppError('Stream not found', 404);
    await cacheSetJson(CacheNs.VIEWERS, slug, stream, CacheTtl.VIEWERS);
    res.json({ success: true, data: stream });
  } catch (err) {
    next(err);
  }
});

router.get('/chat/:slug', async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({ where: { slug: param(req.params.slug) } });
    if (!stream) throw new AppError('Stream not found', 404);
    const messages = await prisma.streamChatMessage.findMany({
      where: { streamId: stream.id, isDeleted: false },
      orderBy: { createdAt: 'asc' },
      take: 150,
    });
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
});

router.post('/chat/:slug', validate(chatSchema), async (req, res, next) => {
  try {
    const decoded = verifyPlaybackToken(req.body.playbackToken);
    if (!decoded) throw new AppError('Invalid playback token', 401);

    const stream = await prisma.stream.findUnique({ where: { slug: param(req.params.slug) } });
    if (!stream || stream.id !== decoded.streamId) throw new AppError('Stream not found', 404);

    const muted = await prisma.streamMute.findFirst({
      where: { streamId: stream.id, nickname: req.body.sender },
    });
    if (muted?.banned) throw new AppError('You are banned from this chat', 403);
    if (muted) throw new AppError('You are muted in this stream', 403);

    if (stream.slowModeSec > 0) {
      const last = await prisma.streamChatMessage.findFirst({
        where: { streamId: stream.id, sender: req.body.sender },
        orderBy: { createdAt: 'desc' },
      });
      if (last) {
        const elapsed = (Date.now() - last.createdAt.getTime()) / 1000;
        if (elapsed < stream.slowModeSec) {
          throw new AppError(`Slow mode: wait ${Math.ceil(stream.slowModeSec - elapsed)}s`, 429);
        }
      }
    }

    let gifUrl = req.body.gifUrl as string | undefined;
    if (gifUrl) {
      if (!stream.allowGifs) throw new AppError('GIFs are disabled for this stream', 403);
      if (!isGifUrl(gifUrl)) throw new AppError('Invalid GIF URL', 400);
    }

    const message = await prisma.streamChatMessage.create({
      data: {
        streamId: stream.id,
        sender: req.body.sender,
        message: filterProfanity(req.body.message),
        emoji: req.body.emoji,
        gifUrl,
      },
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
});

router.post('/chat/:slug/announce', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({ where: { slug: param(req.params.slug) } });
    if (!stream) throw new AppError('Stream not found', 404);
    const text = String(req.body?.message || '').slice(0, 500);
    if (!text) throw new AppError('message required', 400);
    const message = await prisma.streamChatMessage.create({
      data: {
        streamId: stream.id,
        sender: 'SV Live',
        message: text,
        isAnnouncement: true,
        isPinned: Boolean(req.body?.pin),
      },
    });
    if (req.body?.pin) {
      await prisma.stream.update({
        where: { id: stream.id },
        data: { pinnedMessage: text },
      });
    }
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
});

router.delete('/chat/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const message = await prisma.streamChatMessage.update({
      where: { id: param(req.params.id) },
      data: { isDeleted: true, moderated: true },
    });
    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
});

router.get('/analytics/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const streamId = param(req.params.id);
    const stream = await prisma.stream.findUnique({ where: { id: streamId } });
    if (!stream) throw new AppError('Stream not found', 404);

    const sessions = await prisma.viewerSession.findMany({ where: { streamId } });
    const byCountry: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    const byDevice: Record<string, number> = {};
    const byBrowser: Record<string, number> = {};
    const byOs: Record<string, number> = {};
    let totalWatch = 0;
    let returning = 0;
    for (const s of sessions) {
      byCountry[s.country || 'Unknown'] = (byCountry[s.country || 'Unknown'] || 0) + 1;
      byCity[s.city || 'Unknown'] = (byCity[s.city || 'Unknown'] || 0) + 1;
      byDevice[s.device || 'Unknown'] = (byDevice[s.device || 'Unknown'] || 0) + 1;
      byBrowser[s.browser || 'Unknown'] = (byBrowser[s.browser || 'Unknown'] || 0) + 1;
      byOs[s.os || 'Unknown'] = (byOs[s.os || 'Unknown'] || 0) + 1;
      totalWatch += s.watchSeconds;
      if (s.isReturning) returning += 1;
    }

    res.json({
      success: true,
      data: {
        currentViewers: stream.currentViewers,
        peakViewers: stream.peakViewers,
        totalJoins: stream.totalJoins,
        avgWatchSeconds: sessions.length ? Math.round(totalWatch / sessions.length) : 0,
        avgSessionDuration: sessions.length ? Math.round(totalWatch / sessions.length) : 0,
        returningVisitors: returning,
        byCountry,
        byCity,
        byDevice,
        byBrowser,
        byOs,
        lifecycle: computeLifecycle(stream),
        status: stream.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

/** Live ops dashboard metrics */
router.get('/ops/dashboard', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (_req, res, next) => {
  try {
    const [live, upcoming, completed, cancelled, mostViewed] = await Promise.all([
      prisma.stream.findMany({ where: { status: { in: ['LIVE', 'PAUSED', 'OFFLINE'] } }, orderBy: { currentViewers: 'desc' } }),
      prisma.stream.findMany({
        where: { status: { in: ['SCHEDULED', 'WAITING'] }, scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
      }),
      prisma.stream.findMany({ where: { status: 'ENDED' }, orderBy: { endedAt: 'desc' }, take: 10 }),
      prisma.stream.findMany({ where: { status: 'ARCHIVED' }, take: 10 }),
      prisma.stream.findFirst({ orderBy: { peakViewers: 'desc' } }),
    ]);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const cpus = os.cpus();
    let diskFreeGb: number | null = null;
    let diskTotalGb: number | null = null;
    try {
      const stat = fs.statfsSync('/');
      diskTotalGb = Math.round((stat.blocks * stat.bsize) / 1e9);
      diskFreeGb = Math.round((stat.bfree * stat.bsize) / 1e9);
    } catch {
      /* non-posix or unsupported */
    }

    const currentViewers = live.reduce((n, s) => n + s.currentViewers, 0);

    res.json({
      success: true,
      data: {
        system: {
          cpuCount: cpus.length,
          cpuModel: cpus[0]?.model,
          loadAvg: os.loadavg(),
          ram: {
            totalMb: Math.round(totalMem / 1e6),
            usedMb: Math.round((totalMem - freeMem) / 1e6),
            freeMb: Math.round(freeMem / 1e6),
            usedPercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
          },
          disk: { freeGb: diskFreeGb, totalGb: diskTotalGb },
          uptimeSec: Math.round(os.uptime()),
          hostname: os.hostname(),
        },
        streaming: {
          currentViewers,
          liveCount: live.filter((s) => s.status === 'LIVE').length,
          bandwidthEstimateMbps: Math.round(currentViewers * 2.5 * 10) / 10,
          live,
          upcoming,
          completed,
          cancelled,
          mostViewed,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/recordings', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (_req, res, next) => {
  try {
    const recordings = await prisma.recording.findMany({
      orderBy: { createdAt: 'desc' },
      include: { stream: { select: { title: true, slug: true } } },
    });
    res.json({ success: true, data: recordings });
  } catch (err) {
    next(err);
  }
});

router.patch('/recordings/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const body = req.body as {
      title?: string;
      isPublic?: boolean;
      expiresAt?: string | null;
      password?: string | null;
      trimStartSec?: number;
      trimEndSec?: number;
      previewUrl?: string;
    };
    let passwordHash: string | null | undefined;
    if (body.password === null) passwordHash = null;
    else if (typeof body.password === 'string' && body.password.length >= 4) {
      passwordHash = await hashPassword(body.password);
    }

    const recording = await prisma.recording.update({
      where: { id: param(req.params.id) },
      data: {
        ...(body.title ? { title: body.title } : {}),
        ...(typeof body.isPublic === 'boolean' ? { isPublic: body.isPublic } : {}),
        ...(typeof body.isPublic === 'boolean' && body.isPublic ? { shareToken: sessionId() } : {}),
        ...(body.expiresAt !== undefined
          ? { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }
          : {}),
        ...(passwordHash !== undefined ? { passwordHash } : {}),
        ...(typeof body.trimStartSec === 'number' ? { trimStartSec: body.trimStartSec } : {}),
        ...(typeof body.trimEndSec === 'number' ? { trimEndSec: body.trimEndSec } : {}),
        ...(body.previewUrl ? { previewUrl: body.previewUrl } : {}),
      },
    });
    res.json({ success: true, data: recording });
  } catch (err) {
    next(err);
  }
});

router.get('/recordings/share/:token', async (req, res, next) => {
  try {
    const recording = await prisma.recording.findUnique({
      where: { shareToken: param(req.params.token) },
      include: { stream: { select: { title: true, slug: true } } },
    });
    if (!recording || !recording.isPublic) throw new AppError('Recording not found', 404);
    if (recording.expiresAt && recording.expiresAt < new Date()) {
      throw new AppError('Recording link expired', 410);
    }
    if (recording.passwordHash) {
      const password = String(req.query.password || '');
      if (!password || !(await comparePassword(password, recording.passwordHash))) {
        throw new AppError('Password required', 401);
      }
    }
    res.json({
      success: true,
      data: {
        id: recording.id,
        title: recording.title,
        fileUrl: recording.fileUrl,
        previewUrl: recording.previewUrl,
        thumbnail: recording.thumbnail,
        durationSec: recording.durationSec,
        trimStartSec: recording.trimStartSec,
        trimEndSec: recording.trimEndSec,
        stream: recording.stream,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/recordings/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    await prisma.recording.delete({ where: { id: param(req.params.id) } });
    res.json({ success: true, message: 'Recording deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
