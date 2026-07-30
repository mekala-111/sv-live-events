import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import { resolveNearestEdge } from '../services/cluster.js';

const router = Router();

router.get('/config', (_req, res) => {
  res.json({
    success: true,
    data: {
      platforms: ['Android TV', 'Apple TV', 'Fire TV', 'Samsung Tizen', 'LG webOS'],
      ui: {
        focusColor: '#C9A14A',
        largeType: true,
        remoteNavigation: true,
        gridColumns: 4,
      },
      endpoints: {
        catalog: '/api/tv/catalog',
        live: '/api/tv/live',
        library: '/api/library',
        edge: '/api/edge/resolve',
      },
    },
  });
});

router.get('/catalog', async (_req, res, next) => {
  try {
    const [upcoming, live, library] = await Promise.all([
      prisma.stream.findMany({
        where: { status: { in: ['SCHEDULED', 'WAITING'] } },
        orderBy: { scheduledAt: 'asc' },
        take: 20,
        select: { id: true, title: true, slug: true, eventType: true, thumbnail: true, scheduledAt: true, status: true },
      }),
      prisma.stream.findMany({
        where: { status: { in: ['LIVE', 'PAUSED'] } },
        orderBy: { currentViewers: 'desc' },
        take: 20,
        select: { id: true, title: true, slug: true, eventType: true, thumbnail: true, currentViewers: true, status: true },
      }),
      prisma.contentAsset.findMany({
        where: { isPublic: true },
        take: 40,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    res.json({
      success: true,
      data: {
        rows: [
          { title: 'Live Now', items: live },
          { title: 'Upcoming', items: upcoming },
          { title: 'Library', items: library },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/live/:slug', async (req, res, next) => {
  try {
    const stream = await prisma.stream.findUnique({
      where: { slug: param(req.params.slug) },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        eventType: true,
        thumbnail: true,
        currentViewers: true,
        hlsUrl: true,
      },
    });
    if (!stream) throw new AppError('Stream not found', 404);
    const edge = await resolveNearestEdge({ country: String(req.query.country || 'IN') });
    res.json({
      success: true,
      data: {
        ...stream,
        requiresPassword: true,
        edgeRegion: edge?.region,
        layout: 'large-screen',
        remoteHints: ['OK to select', 'Back to exit', '←→ navigate rows'],
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
