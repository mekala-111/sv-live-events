import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import { enqueueBackup, buildObjectKey } from '../services/storage.js';
import { edgeUrl, cacheHeaders } from '../services/cdn.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const category = String(req.query.category || '').trim();
    const collection = String(req.query.collection || '').trim();
    const tag = String(req.query.tag || '').trim();

    const assets = await prisma.contentAsset.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { tags: { contains: q } },
                { category: { contains: q } },
              ],
            }
          : {}),
        ...(category ? { category } : {}),
        ...(collection ? { collection } : {}),
        ...(tag ? { tags: { contains: tag } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.set(cacheHeaders(60));
    res.json({
      success: true,
      data: assets.map((a) => ({
        ...a,
        playbackUrl: edgeUrl(a.fileUrl),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/from-recording/:recordingId', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const recording = await prisma.recording.findUnique({
      where: { id: param(req.params.recordingId) },
      include: { stream: true },
    });
    if (!recording) throw new AppError('Recording not found', 404);

    const key = buildObjectKey(['tenants', recording.stream.tenantId || 'default', 'recordings', recording.id]);
    const asset = await prisma.contentAsset.create({
      data: {
        streamId: recording.streamId,
        recordingId: recording.id,
        tenantId: recording.stream.tenantId,
        title: recording.title,
        category: recording.stream.eventType,
        tags: `${recording.stream.eventType},recording`,
        collection: 'Recordings',
        playlist: recording.stream.slug,
        fileUrl: recording.fileUrl,
        thumbnail: recording.thumbnail,
        durationSec: recording.durationSec,
        isPublic: recording.isPublic,
      },
    });

    await prisma.recording.update({
      where: { id: recording.id },
      data: { storageKey: key, storageProvider: process.env.STORAGE_PROVIDER || 'local' },
    });
    await enqueueBackup(recording.id, recording.fileUrl);

    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
});

router.post('/favourites/:assetId', requireAuth, async (req, res, next) => {
  try {
    const fav = await prisma.contentFavourite.upsert({
      where: {
        userId_assetId: { userId: req.user!.userId, assetId: param(req.params.assetId) },
      },
      create: { userId: req.user!.userId, assetId: param(req.params.assetId) },
      update: {},
    });
    res.json({ success: true, data: fav });
  } catch (err) {
    next(err);
  }
});

router.get('/favourites', requireAuth, async (req, res, next) => {
  try {
    const favs = await prisma.contentFavourite.findMany({
      where: { userId: req.user!.userId },
      include: { asset: true },
    });
    res.json({ success: true, data: favs.map((f) => f.asset) });
  } catch (err) {
    next(err);
  }
});

router.get('/playlists', requireAuth, async (_req, res, next) => {
  try {
    const assets = await prisma.contentAsset.findMany({ select: { playlist: true, collection: true, category: true } });
    const playlists = [...new Set(assets.map((a) => a.playlist).filter(Boolean))];
    const collections = [...new Set(assets.map((a) => a.collection).filter(Boolean))];
    const categories = [...new Set(assets.map((a) => a.category).filter(Boolean))];
    res.json({ success: true, data: { playlists, collections, categories } });
  } catch (err) {
    next(err);
  }
});

export default router;
