import { Router } from 'express';
import os from 'os';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { notifyEvent } from '../utils/notify.js';

const router = Router();

router.get('/enterprise', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (_req, res, next) => {
  try {
    const [bookings, payments, streams, sessions, gifts] = await Promise.all([
      prisma.booking.findMany({ select: { totalAmount: true, status: true, createdAt: true } }),
      prisma.payment.findMany({ where: { status: 'SUCCESS' }, select: { amount: true, createdAt: true } }),
      prisma.stream.findMany({
        select: {
          id: true,
          title: true,
          eventType: true,
          peakViewers: true,
          totalJoins: true,
          status: true,
        },
      }),
      prisma.viewerSession.findMany({
        select: {
          country: true,
          device: true,
          os: true,
          browser: true,
          networkSpeed: true,
          watchSeconds: true,
          isReturning: true,
        },
      }),
      prisma.virtualGift.findMany({ select: { amountInr: true } }),
    ]);

    const revenue = payments.reduce((s, p) => s + p.amount, 0) + gifts.reduce((s, g) => s + g.amountInr, 0);
    const byCountry: Record<string, number> = {};
    const byDevice: Record<string, number> = {};
    const byOs: Record<string, number> = {};
    let watch = 0;
    let returning = 0;
    for (const s of sessions) {
      byCountry[s.country || 'Unknown'] = (byCountry[s.country || 'Unknown'] || 0) + 1;
      byDevice[s.device || 'Unknown'] = (byDevice[s.device || 'Unknown'] || 0) + 1;
      byOs[s.os || 'Unknown'] = (byOs[s.os || 'Unknown'] || 0) + 1;
      watch += s.watchSeconds;
      if (s.isReturning) returning += 1;
    }

    const topEvents = [...streams].sort((a, b) => b.peakViewers - a.peakViewers).slice(0, 8);
    const forecast = Math.round(revenue * 1.12 * 100) / 100;

    // Simple retention buckets (watch seconds heatmap proxy)
    const retention = [0, 0, 0, 0, 0];
    for (const s of sessions) {
      const bucket = Math.min(4, Math.floor(s.watchSeconds / 300));
      retention[bucket] += 1;
    }

    res.json({
      success: true,
      data: {
        revenue: { total: revenue, bookings: bookings.length, forecastNextMonth: forecast },
        bandwidthEstimateGb: Math.round((streams.reduce((n, s) => n + s.totalJoins, 0) * 0.35) * 10) / 10,
        watchTimeHours: Math.round((watch / 3600) * 10) / 10,
        returningVisitors: returning,
        byCountry,
        byDevice,
        byOs,
        retention,
        topEvents,
        heatmap: retention.map((v, i) => ({ minuteRange: `${i * 5}-${(i + 1) * 5}m`, viewers: v })),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/ops/extended', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (_req, res, next) => {
  try {
    const [liveStreams, alerts, redisOk] = await Promise.all([
      prisma.stream.count({ where: { status: { in: ['LIVE', 'PAUSED', 'OFFLINE'] } } }),
      prisma.opsAlert.findMany({ where: { resolved: false }, orderBy: { createdAt: 'desc' }, take: 20 }),
      Promise.resolve(Boolean(process.env.REDIS_URL)),
    ]);

    const mem = process.memoryUsage();
    res.json({
      success: true,
      data: {
        node: {
          uptimeSec: Math.round(process.uptime()),
          heapUsedMb: Math.round(mem.heapUsed / 1e6),
          rssMb: Math.round(mem.rss / 1e6),
          version: process.version,
        },
        host: {
          loadAvg: os.loadavg(),
          cpuCount: os.cpus().length,
          freememMb: Math.round(os.freemem() / 1e6),
        },
        connections: {
          rtmpEstimate: liveStreams,
          webrtcEstimate: liveStreams,
          hlsClients: await prisma.stream.aggregate({ _sum: { currentViewers: true } }).then((r) => r._sum.currentViewers || 0),
        },
        infra: {
          redisConfigured: redisOk,
          database: 'mysql',
          docker: Boolean(process.env.IN_DOCKER),
        },
        alerts,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/ops/alerts', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const alert = await prisma.opsAlert.create({
      data: {
        severity: String(req.body?.severity || 'INFO'),
        source: String(req.body?.source || 'manual'),
        message: String(req.body?.message || 'Alert'),
        channel: String(req.body?.channel || 'IN_APP'),
      },
    });
    if (alert.channel === 'EMAIL' || alert.channel === 'SMS' || alert.channel === 'SLACK') {
      await notifyEvent({
        type: 'EVENT_REMINDER',
        to: { email: process.env.SMTP_FROM },
        subject: `[${alert.severity}] ${alert.source}`,
        message: alert.message,
      });
    }
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
});

export default router;
