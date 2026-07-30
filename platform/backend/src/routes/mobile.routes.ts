import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import { customAlphabet } from 'nanoid';
import { signPlaybackToken } from '../utils/streaming.js';
import { buildViewerWatermark, rotatePlaybackUrl } from '../services/signedMedia.js';
import { resolveNearestEdge } from '../services/cluster.js';

const router = Router();
const qrLogin = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 32);
const pendingQr = new Map<string, { userId?: string; expires: number }>();

router.get('/config', (_req, res) => {
  res.json({
    success: true,
    data: {
      apiVersion: '3.0',
      features: {
        offlinePlayback: true,
        pushNotifications: true,
        backgroundPlayback: true,
        casting: true,
        biometricAuth: true,
        qrLogin: true,
      },
      endpoints: {
        login: '/api/auth/login',
        refresh: '/api/auth/refresh',
        verifyStream: '/api/stream/verify-password/:slug',
        edgeResolve: '/api/edge/resolve',
        library: '/api/library',
        engage: '/api/engage',
        devices: '/api/mobile/devices',
      },
    },
  });
});

router.post(
  '/devices',
  requireAuth,
  validate(
    z.object({
      platform: z.enum(['IOS', 'ANDROID', 'TV_ANDROID', 'TV_APPLE', 'TV_FIRE', 'TV_TIZEN', 'TV_WEBOS']),
      token: z.string().min(8),
      deviceId: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const device = await prisma.deviceToken.upsert({
        where: {
          platform_token: { platform: req.body.platform, token: req.body.token },
        },
        create: {
          userId: req.user!.userId,
          platform: req.body.platform,
          token: req.body.token,
          deviceId: req.body.deviceId,
        },
        update: { userId: req.user!.userId, deviceId: req.body.deviceId },
      });
      res.status(201).json({ success: true, data: device });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/offline-manifest/:assetId', requireAuth, async (req, res, next) => {
  try {
    const asset = await prisma.contentAsset.findUnique({ where: { id: param(req.params.assetId) } });
    if (!asset) throw new AppError('Asset not found', 404);
    res.json({
      success: true,
      data: {
        assetId: asset.id,
        title: asset.title,
        downloadUrl: asset.fileUrl,
        thumbnail: asset.thumbnail,
        durationSec: asset.durationSec,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        drm: 'NONE',
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/qr-login/start', async (_req, res) => {
  const code = qrLogin();
  pendingQr.set(code, { expires: Date.now() + 120_000 });
  res.json({
    success: true,
    data: { code, expiresInSec: 120, pollUrl: `/api/mobile/qr-login/poll/${code}` },
  });
});

router.post('/qr-login/approve/:code', requireAuth, async (req, res, next) => {
  try {
    const entry = pendingQr.get(param(req.params.code));
    if (!entry || entry.expires < Date.now()) throw new AppError('QR code expired', 410);
    entry.userId = req.user!.userId;
    pendingQr.set(param(req.params.code), entry);
    res.json({ success: true, message: 'Approved' });
  } catch (err) {
    next(err);
  }
});

router.get('/qr-login/poll/:code', async (req, res, next) => {
  try {
    const entry = pendingQr.get(param(req.params.code));
    if (!entry || entry.expires < Date.now()) throw new AppError('QR code expired', 410);
    if (!entry.userId) return res.json({ success: true, data: { status: 'PENDING' } });
    const user = await prisma.user.findUnique({ where: { id: entry.userId } });
    pendingQr.delete(param(req.params.code));
    res.json({
      success: true,
      data: {
        status: 'APPROVED',
        user: user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null,
        note: 'Client should call /api/auth/login or issue tokens via existing auth flow',
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/playback-session',
  optionalAuth,
  validate(
    z.object({
      streamId: z.string(),
      sessionToken: z.string(),
      slug: z.string(),
      hlsUrl: z.string(),
      country: z.string().optional(),
      displayName: z.string().optional(),
      email: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const edge = await resolveNearestEdge({ country: req.body.country });
      const rotated = rotatePlaybackUrl(req.body.hlsUrl, req.body.streamId, req.body.sessionToken);
      const watermark = buildViewerWatermark({
        name: req.body.displayName,
        email: req.body.email,
        sessionId: req.body.sessionToken,
      });
      res.json({
        success: true,
        data: {
          playbackToken: signPlaybackToken({
            streamId: req.body.streamId,
            slug: req.body.slug,
            sessionToken: req.body.sessionToken,
          }),
          hlsUrl: rotated,
          edgeRegion: edge?.region,
          watermark,
          casting: { airplay: true, chromecast: true },
          backgroundPlayback: true,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
