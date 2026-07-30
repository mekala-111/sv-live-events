import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import { enqueueAiJob } from '../services/aiJobs.js';
import {
  GPU_WORKER_CAPABILITIES,
  mapAiTypeToCapability,
  buildTimestampMetadata,
  type GpuJobEnvelope,
} from '../services/gpuWorkerContract.js';

const router = Router();

const jobSchema = z.object({
  type: z.enum([
    'DIRECTOR',
    'HIGHLIGHT',
    'STT',
    'FACE_TRACK',
    'REEL',
    'WEDDING_TIMELINE',
    'CROWD',
    'EMOTION',
    'OBJECT',
    'PERSON',
  ]),
  streamId: z.string().optional(),
  recordingId: z.string().optional(),
  language: z.enum(['en', 'te', 'hi', 'ta', 'kn', 'ml']).optional(),
});

router.post('/jobs', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), validate(jobSchema), async (req, res, next) => {
  try {
    const job = await enqueueAiJob({
      type: req.body.type,
      streamId: req.body.streamId,
      recordingId: req.body.recordingId,
      input: { language: req.body.language || 'en' },
    });
    res.status(202).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
});

router.get('/jobs/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const job = await prisma.aiJob.findUnique({ where: { id: param(req.params.id) } });
    if (!job) throw new AppError('Job not found', 404);
    res.json({
      success: true,
      data: {
        ...job,
        input: job.inputJson ? JSON.parse(job.inputJson) : null,
        output: job.outputJson ? JSON.parse(job.outputJson) : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/jobs', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const streamId = req.query.streamId ? String(req.query.streamId) : undefined;
    const jobs = await prisma.aiJob.findMany({
      where: streamId ? { streamId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
});

router.get('/subtitles/:streamId/download/:lang', requireAuth, async (req, res, next) => {
  try {
    const track = await prisma.subtitleTrack.findFirst({
      where: { streamId: param(req.params.streamId), language: param(req.params.lang) },
      orderBy: { createdAt: 'desc' },
    });
    if (!track?.content) throw new AppError('Subtitle not found', 404);
    res.setHeader('Content-Type', 'text/vtt');
    res.setHeader('Content-Disposition', `attachment; filename="subs-${track.language}.vtt"`);
    res.send(track.content);
  } catch (err) {
    next(err);
  }
});

router.get('/workers/capabilities', (_req, res) => {
  res.json({ success: true, data: GPU_WORKER_CAPABILITIES });
});

/** GPU workers claim next queued job */
router.post('/workers/claim', async (req, res, next) => {
  try {
    const workerKey = String(req.headers['x-worker-key'] || '');
    if (process.env.AI_WORKER_KEY && workerKey !== process.env.AI_WORKER_KEY) {
      throw new AppError('Invalid worker key', 401);
    }
    const job = await prisma.aiJob.findFirst({
      where: { status: 'QUEUED' },
      orderBy: { createdAt: 'asc' },
    });
    if (!job) return res.json({ success: true, data: null });

    await prisma.aiJob.update({
      where: { id: job.id },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    const envelope: GpuJobEnvelope = {
      jobId: job.id,
      capability: mapAiTypeToCapability(job.type),
      streamId: job.streamId,
      recordingId: job.recordingId,
      input: JSON.parse(job.inputJson || '{}'),
      callbackPath: `/api/ai/workers/complete/${job.id}`,
    };
    res.json({ success: true, data: envelope });
  } catch (err) {
    next(err);
  }
});

router.post('/workers/complete/:id', async (req, res, next) => {
  try {
    const workerKey = String(req.headers['x-worker-key'] || '');
    if (process.env.AI_WORKER_KEY && workerKey !== process.env.AI_WORKER_KEY) {
      throw new AppError('Invalid worker key', 401);
    }
    const output = req.body?.output || {};
    if (Array.isArray(output.clips)) {
      output.timestamps = buildTimestampMetadata(output.clips);
    }
    const job = await prisma.aiJob.update({
      where: { id: param(req.params.id) },
      data: {
        status: req.body?.error ? 'FAILED' : 'DONE',
        error: req.body?.error ? String(req.body.error) : null,
        outputJson: JSON.stringify(output),
        finishedAt: new Date(),
      },
    });
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
});

export default router;
