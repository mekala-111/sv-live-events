import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import { buildStreamCredentials } from '../utils/streaming.js';
import { hashPassword } from '../utils/password.js';
import { assignOriginForStream } from '../services/cluster.js';

const router = Router();
const staff = ['ADMIN', 'SUPER_ADMIN', 'STAFF'] as const;

function icsEscape(s: string) {
  return s.replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
}

router.get('/series', requireAuth, requireRole(...staff), async (_req, res, next) => {
  try {
    const series = await prisma.eventSeries.findMany({
      include: { streams: { select: { id: true, title: true, scheduledAt: true, status: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: series });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/series',
  requireAuth,
  requireRole(...staff),
  validate(
    z.object({
      title: z.string().min(2),
      eventType: z.string().min(2),
      description: z.string().optional(),
      rrule: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const series = await prisma.eventSeries.create({ data: req.body });
      res.status(201).json({ success: true, data: series });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/templates', requireAuth, requireRole(...staff), async (_req, res, next) => {
  try {
    const templates = await prisma.eventTemplate.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/templates',
  requireAuth,
  requireRole(...staff),
  validate(
    z.object({
      name: z.string().min(2),
      eventType: z.string().min(2),
      payload: z.record(z.string(), z.unknown()),
    }),
  ),
  async (req, res, next) => {
    try {
      const t = await prisma.eventTemplate.create({
        data: {
          name: req.body.name,
          eventType: req.body.eventType,
          payloadJson: JSON.stringify(req.body.payload),
        },
      });
      res.status(201).json({ success: true, data: t });
    } catch (err) {
      next(err);
    }
  },
);

router.post('/clone/:streamId', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const source = await prisma.stream.findUnique({ where: { id: param(req.params.streamId) } });
    if (!source) throw new AppError('Stream not found', 404);
    const creds = buildStreamCredentials(`${source.title} Copy`);
    const origin = await assignOriginForStream();
    const passwordHash = source.passwordHash;
    const stream = await prisma.stream.create({
      data: {
        title: `${source.title} (Copy)`,
        slug: creds.slug,
        eventType: source.eventType,
        description: source.description,
        rtmpUrl: origin?.rtmpUrl || creds.rtmpUrl,
        streamKey: creds.streamKey,
        hlsUrl: origin ? `${origin.hlsBaseUrl}/${creds.streamKey}.m3u8` : creds.hlsUrl,
        webrtcUrl: origin?.webrtcBaseUrl
          ? `${origin.webrtcBaseUrl}/${creds.streamKey}`
          : creds.webrtcUrl,
        passwordHash,
        publisherToken: creds.publisherToken,
        isRecording: source.isRecording,
        slowModeSec: source.slowModeSec,
        tenantId: source.tenantId,
        seriesId: source.seriesId,
        templateId: source.templateId,
        originNodeId: origin?.id,
        maxDevices: source.maxDevices,
        maxConcurrent: source.maxConcurrent,
        geoAllow: source.geoAllow,
        geoBlock: source.geoBlock,
        status: 'SCHEDULED',
        createdById: req.user!.userId,
        scheduledAt: req.body?.scheduledAt ? new Date(req.body.scheduledAt) : null,
      },
    });
    if (origin) {
      await prisma.mediaNode.update({
        where: { id: origin.id },
        data: { activeStreams: { increment: 1 } },
      });
    }
    res.status(201).json({ success: true, data: stream });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/bulk-schedule',
  requireAuth,
  requireRole(...staff),
  validate(
    z.object({
      titlePrefix: z.string().min(2),
      eventType: z.string().min(2),
      password: z.string().min(4),
      dates: z.array(z.string().datetime()).min(1).max(50),
      seriesId: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const created = [];
      for (const [i, date] of (req.body.dates as string[]).entries()) {
        const creds = buildStreamCredentials(`${req.body.titlePrefix} ${i + 1}`);
        const origin = await assignOriginForStream();
        const stream = await prisma.stream.create({
          data: {
            title: `${req.body.titlePrefix} #${i + 1}`,
            slug: creds.slug,
            eventType: req.body.eventType,
            rtmpUrl: origin?.rtmpUrl || creds.rtmpUrl,
            streamKey: creds.streamKey,
            hlsUrl: origin ? `${origin.hlsBaseUrl}/${creds.streamKey}.m3u8` : creds.hlsUrl,
            webrtcUrl: creds.webrtcUrl,
            passwordHash: await hashPassword(req.body.password),
            publisherToken: creds.publisherToken,
            scheduledAt: new Date(date),
            status: 'SCHEDULED',
            seriesId: req.body.seriesId,
            originNodeId: origin?.id,
            createdById: req.user!.userId,
          },
        });
        created.push(stream);
      }
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/:streamId/ics', async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({ where: { id: param(req.params.streamId) } });
    if (!stream) throw new AppError('Stream not found', 404);
    const start = stream.scheduledAt || stream.startedAt || new Date();
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const stamp = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const client = process.env.CLIENT_URL || 'http://localhost:5173';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SV Live Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${stream.id}@svliveevents.com`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${icsEscape(stream.title)}`,
      `DESCRIPTION:${icsEscape(stream.description || stream.eventType)}`,
      `URL:${client}/live/${stream.slug}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${stream.slug}.ics"`);
    res.send(ics);
  } catch (err) {
    next(err);
  }
});

router.get('/:streamId/calendar-links', async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({ where: { id: param(req.params.streamId) } });
    if (!stream) throw new AppError('Stream not found', 404);
    const start = stream.scheduledAt || new Date();
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const text = encodeURIComponent(stream.title);
    const details = encodeURIComponent(stream.description || '');
    const dates = `${start.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${end
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')}`;
    const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
    const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${text}&body=${details}&startdt=${start.toISOString()}&enddt=${end.toISOString()}`;
    res.json({
      success: true,
      data: {
        google,
        outlook,
        ics: `/api/events/${stream.id}/ics`,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
