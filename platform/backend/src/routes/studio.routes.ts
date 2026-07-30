import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import { enqueueAiJob } from '../services/aiJobs.js';

const router = Router();
const staff = ['ADMIN', 'SUPER_ADMIN', 'STAFF'] as const;

const cameraSchema = z.object({
  name: z.string().min(1),
  sourceType: z.enum(['OBS', 'RTMP', 'WEBRTC', 'PTZ', 'FILE']),
  ingestUrl: z.string().optional(),
  previewUrl: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const overlaySchema = z.object({
  kind: z.enum(['LOGO', 'LOWER_THIRD', 'TICKER', 'COUNTDOWN', 'SCOREBOARD', 'SPONSOR', 'NAME_CARD', 'SLATE']),
  label: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).or(z.string()),
  visible: z.boolean().optional(),
  zIndex: z.number().int().optional(),
});

async function ensureStudio(streamId: string) {
  return prisma.studioState.upsert({
    where: { streamId },
    create: { streamId },
    update: {},
  });
}

router.get('/:streamId', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const streamId = param(req.params.streamId);
    const stream = await prisma.stream.findUnique({ where: { id: streamId } });
    if (!stream) throw new AppError('Stream not found', 404);

    const [state, cameras, overlays] = await Promise.all([
      ensureStudio(streamId),
      prisma.studioCamera.findMany({ where: { streamId }, orderBy: { sortOrder: 'asc' } }),
      prisma.studioOverlay.findMany({ where: { streamId }, orderBy: { zIndex: 'asc' } }),
    ]);

    res.json({
      success: true,
      data: {
        stream: { id: stream.id, title: stream.title, slug: stream.slug, status: stream.status, hlsUrl: stream.hlsUrl },
        state,
        cameras,
        overlays,
        hotkeys: {
          '1-9': 'Take camera N to program',
          p: 'Preview selected',
          t: 'Take preview → program',
          s: 'Emergency slate',
          a: 'Toggle AI director',
          m: 'Mute music',
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:streamId/cameras', requireAuth, requireRole(...staff), validate(cameraSchema), async (req, res, next) => {
  try {
    const streamId = param(req.params.streamId);
    await ensureStudio(streamId);
    const count = await prisma.studioCamera.count({ where: { streamId } });
    const cam = await prisma.studioCamera.create({
      data: {
        streamId,
        name: req.body.name,
        sourceType: req.body.sourceType,
        ingestUrl: req.body.ingestUrl,
        previewUrl: req.body.previewUrl,
        sortOrder: req.body.sortOrder ?? count,
        isPreview: count === 0,
        isProgram: count === 0,
      },
    });
    if (count === 0) {
      await prisma.studioState.update({
        where: { streamId },
        data: { programCameraId: cam.id, previewCameraId: cam.id },
      });
    }
    res.status(201).json({ success: true, data: cam });
  } catch (err) {
    next(err);
  }
});

router.post('/:streamId/take/:cameraId', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const streamId = param(req.params.streamId);
    const cameraId = param(req.params.cameraId);
    await prisma.studioCamera.updateMany({ where: { streamId }, data: { isProgram: false } });
    await prisma.studioCamera.update({ where: { id: cameraId }, data: { isProgram: true } });
    const state = await prisma.studioState.update({
      where: { streamId },
      data: { programCameraId: cameraId, emergencySlate: false },
    });
    res.json({ success: true, data: state });
  } catch (err) {
    next(err);
  }
});

router.post('/:streamId/preview/:cameraId', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const streamId = param(req.params.streamId);
    const cameraId = param(req.params.cameraId);
    await prisma.studioCamera.updateMany({ where: { streamId }, data: { isPreview: false } });
    await prisma.studioCamera.update({ where: { id: cameraId }, data: { isPreview: true } });
    const state = await prisma.studioState.update({
      where: { streamId },
      data: { previewCameraId: cameraId },
    });
    res.json({ success: true, data: state });
  } catch (err) {
    next(err);
  }
});

router.post('/:streamId/cut', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const streamId = param(req.params.streamId);
    const state = await ensureStudio(streamId);
    if (!state.previewCameraId) throw new AppError('No preview camera', 400);
    await prisma.studioCamera.updateMany({ where: { streamId }, data: { isProgram: false } });
    await prisma.studioCamera.update({ where: { id: state.previewCameraId }, data: { isProgram: true } });
    const updated = await prisma.studioState.update({
      where: { streamId },
      data: { programCameraId: state.previewCameraId, emergencySlate: false },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.patch('/:streamId/state', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const streamId = param(req.params.streamId);
    await ensureStudio(streamId);
    const body = req.body as Record<string, unknown>;
    const state = await prisma.studioState.update({
      where: { streamId },
      data: {
        ...(typeof body.layout === 'string' ? { layout: body.layout } : {}),
        ...(typeof body.audioMaster === 'number' ? { audioMaster: body.audioMaster } : {}),
        ...(typeof body.micLevel === 'number' ? { micLevel: body.micLevel } : {}),
        ...(typeof body.musicLevel === 'number' ? { musicLevel: body.musicLevel } : {}),
        ...(typeof body.musicMuted === 'boolean' ? { musicMuted: body.musicMuted } : {}),
        ...(typeof body.emergencySlate === 'boolean' ? { emergencySlate: body.emergencySlate } : {}),
        ...(typeof body.aiDirectorOn === 'boolean' ? { aiDirectorOn: body.aiDirectorOn } : {}),
        ...(typeof body.sceneName === 'string' ? { sceneName: body.sceneName } : {}),
      },
    });
    if (state.aiDirectorOn) {
      await enqueueAiJob({ type: 'DIRECTOR', streamId });
    }
    res.json({ success: true, data: state });
  } catch (err) {
    next(err);
  }
});

router.post('/:streamId/ptz/:cameraId', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const cam = await prisma.studioCamera.update({
      where: { id: param(req.params.cameraId) },
      data: {
        ...(typeof req.body.pan === 'number' ? { ptzPan: req.body.pan } : {}),
        ...(typeof req.body.tilt === 'number' ? { ptzTilt: req.body.tilt } : {}),
        ...(typeof req.body.zoom === 'number' ? { ptzZoom: req.body.zoom } : {}),
      },
    });
    res.json({ success: true, data: cam, note: 'PTZ values stored — bridge to camera protocol via edge agent' });
  } catch (err) {
    next(err);
  }
});

router.post('/:streamId/overlays', requireAuth, requireRole(...staff), validate(overlaySchema), async (req, res, next) => {
  try {
    const streamId = param(req.params.streamId);
    const payload = typeof req.body.payload === 'string' ? req.body.payload : JSON.stringify(req.body.payload);
    const overlay = await prisma.studioOverlay.create({
      data: {
        streamId,
        kind: req.body.kind,
        label: req.body.label,
        payload,
        visible: req.body.visible ?? false,
        zIndex: req.body.zIndex ?? 10,
      },
    });
    res.status(201).json({ success: true, data: overlay });
  } catch (err) {
    next(err);
  }
});

router.patch('/overlays/:id', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const overlay = await prisma.studioOverlay.update({
      where: { id: param(req.params.id) },
      data: {
        ...(typeof req.body.visible === 'boolean' ? { visible: req.body.visible } : {}),
        ...(req.body.label ? { label: req.body.label } : {}),
        ...(req.body.payload
          ? { payload: typeof req.body.payload === 'string' ? req.body.payload : JSON.stringify(req.body.payload) }
          : {}),
      },
    });
    res.json({ success: true, data: overlay });
  } catch (err) {
    next(err);
  }
});

router.post('/:streamId/obs-remote', requireAuth, requireRole(...staff), async (req, res, next) => {
  try {
    const action = String(req.body?.action || 'scene');
    res.json({
      success: true,
      data: {
        queued: true,
        action,
        scene: req.body?.scene,
        note: 'Connect OBS WebSocket agent (obs-websocket) to apply remotely',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
