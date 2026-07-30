import { Router } from 'express';
import { resolveNearestEdge, assignOriginForStream, REGIONS } from '../services/cluster.js';
import { originFailover, edgeUrl } from '../services/cdn.js';
import { prisma } from '../lib/prisma.js';
import { param } from '../utils/params.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

/** Viewer: resolve nearest edge + failover HLS for a stream slug */
router.get('/resolve', async (req, res, next) => {
  try {
    const country = req.query.country ? String(req.query.country) : undefined;
    const lat = req.query.lat != null ? Number(req.query.lat) : undefined;
    const lon = req.query.lon != null ? Number(req.query.lon) : undefined;
    const slug = req.query.slug ? String(req.query.slug) : undefined;

    const edge = await resolveNearestEdge({ country, lat, lon });
    const origin = await assignOriginForStream();

    let hlsUrl: string | null = null;
    let streamKey: string | null = null;
    if (slug) {
      const stream = await prisma.stream.findUnique({ where: { slug } });
      if (!stream) throw new AppError('Stream not found', 404);
      streamKey = stream.streamKey;
      const base = edge?.hlsBaseUrl || stream.hlsUrl || origin?.hlsBaseUrl;
      hlsUrl = base?.includes('.m3u8') ? base : `${base}/${stream.streamKey}.m3u8`;
    }

    const failover = originFailover(
      hlsUrl || '',
      origin && streamKey ? `${origin.hlsBaseUrl}/${streamKey}.m3u8` : undefined,
    );

    res.json({
      success: true,
      data: {
        regions: REGIONS,
        edge: edge
          ? {
              id: edge.id,
              region: edge.region,
              city: edge.city,
              hlsBaseUrl: edge.hlsBaseUrl,
              status: edge.status,
            }
          : null,
        origin: origin
          ? { id: origin.id, region: origin.region, rtmpUrl: origin.rtmpUrl, status: origin.status }
          : null,
        playback: {
          hlsUrl: hlsUrl ? edgeUrl(hlsUrl, edge?.region) : null,
          failover,
          geoDnsHint: 'Point viewer CDN CNAME to GeoDNS → regional edges',
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/nodes/:region', async (req, res, next) => {
  try {
    const region = param(req.params.region).toUpperCase();
    const nodes = await prisma.mediaNode.findMany({ where: { region } });
    res.json({ success: true, data: nodes });
  } catch (err) {
    next(err);
  }
});

export default router;
