import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import {
  assignOriginForStream,
  drainNode,
  ensureDefaultNodes,
  evaluateAutoscaling,
  recordNodeHealth,
  REGIONS,
} from '../services/cluster.js';
import { startSpan } from '../services/observability.js';

const router = Router();
const staff = ['ADMIN', 'SUPER_ADMIN', 'STAFF'] as const;

router.get('/regions', (_req, res) => {
  res.json({ success: true, data: REGIONS });
});

router.get('/nodes', requireAuth, requireRole(...staff), async (_req, res, next) => {
  try {
    await ensureDefaultNodes();
    const nodes = await prisma.mediaNode.findMany({ orderBy: [{ role: 'asc' }, { region: 'asc' }] });
    res.json({ success: true, data: nodes });
  } catch (err) {
    next(err);
  }
});

router.post('/nodes/:id/health', async (req, res, next) => {
  try {
    const node = await recordNodeHealth(param(req.params.id), {
      cpuPercent: Number(req.body?.cpuPercent ?? 0),
      bandwidthMbps: Number(req.body?.bandwidthMbps ?? 0),
      activeStreams: Number(req.body?.activeStreams ?? 0),
      activeViewers: Number(req.body?.activeViewers ?? 0),
    });
    res.json({ success: true, data: node });
  } catch (err) {
    next(err);
  }
});

router.post('/nodes/:id/drain', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const node = await drainNode(param(req.params.id));
    res.json({ success: true, data: node, note: 'No new streams assigned; existing broadcasts continue' });
  } catch (err) {
    next(err);
  }
});

router.post('/nodes/:id/undrain', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const node = await prisma.mediaNode.update({
      where: { id: param(req.params.id) },
      data: { status: 'HEALTHY' },
    });
    res.json({ success: true, data: node });
  } catch (err) {
    next(err);
  }
});

router.post('/assign-origin', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const span = startSpan('cluster.assign_origin');
    const streamId = req.body?.streamId ? String(req.body.streamId) : null;
    const origin = await assignOriginForStream();
    if (!origin) throw new AppError('No healthy origin available', 503);

    if (streamId) {
      await prisma.stream.update({
        where: { id: streamId },
        data: {
          originNodeId: origin.id,
          rtmpUrl: origin.rtmpUrl,
          hlsUrl: `${origin.hlsBaseUrl}/${(await prisma.stream.findUnique({ where: { id: streamId } }))?.streamKey}.m3u8`,
          webrtcUrl: origin.webrtcBaseUrl
            ? `${origin.webrtcBaseUrl}/${(await prisma.stream.findUnique({ where: { id: streamId } }))?.streamKey}`
            : undefined,
        },
      });
      await prisma.mediaNode.update({
        where: { id: origin.id },
        data: { activeStreams: { increment: 1 } },
      });
    }
    span.end();
    res.json({ success: true, data: origin });
  } catch (err) {
    next(err);
  }
});

router.get('/autoscaling', requireAuth, requireRole(...staff), async (_req, res, next) => {
  try {
    const result = await evaluateAutoscaling();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/autoscaling/policy',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(
    z.object({
      cpuThreshold: z.number().optional(),
      bandwidthMbpsMax: z.number().optional(),
      viewersPerNodeMax: z.number().int().optional(),
      cooldownSec: z.number().int().optional(),
      minNodes: z.number().int().optional(),
      maxNodes: z.number().int().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      let policy = await prisma.scalingPolicy.findFirst({ where: { isActive: true } });
      if (!policy) policy = await prisma.scalingPolicy.create({ data: { name: 'default' } });
      const updated = await prisma.scalingPolicy.update({
        where: { id: policy.id },
        data: req.body,
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

router.post('/rolling-upgrade', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const region = String(req.body?.region || '');
    const nodes = await prisma.mediaNode.findMany({
      where: { role: 'ORIGIN', ...(region ? { region } : {}) },
      orderBy: { name: 'asc' },
    });
    const plan = nodes.map((n, i) => ({
      step: i + 1,
      nodeId: n.id,
      name: n.name,
      action: 'drain → upgrade → undrain → health-check',
    }));
    res.json({
      success: true,
      data: { plan, note: 'Active broadcasts stay on undrained nodes during rolling upgrade' },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
