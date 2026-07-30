import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { param } from '../utils/params.js';
import { enqueueMediaJob, RENDITIONS } from '../services/ffmpegWorker.js';

const router = Router();

const jobSchema = z.object({
  type: z.enum(['TRANSCODE', 'THUMBNAILS', 'PREVIEW', 'POSTER', 'WAVEFORM', 'ABR_HLS']),
  streamId: z.string().optional(),
  recordingId: z.string().optional(),
  sourceUrl: z.string().optional(),
  thumbIntervalSec: z.number().optional(),
});

router.get('/renditions', (_req, res) => {
  res.json({ success: true, data: RENDITIONS });
});

router.post('/jobs', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), validate(jobSchema), async (req, res, next) => {
  try {
    const job = await enqueueMediaJob({
      type: req.body.type,
      streamId: req.body.streamId,
      recordingId: req.body.recordingId,
      input: {
        sourceUrl: req.body.sourceUrl,
        thumbIntervalSec: req.body.thumbIntervalSec,
      },
    });
    res.status(202).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
});

router.get('/jobs/:id', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const job = await prisma.mediaJob.findUnique({ where: { id: param(req.params.id) } });
    if (!job) throw new AppError('Job not found', 404);
    res.json({
      success: true,
      data: {
        ...job,
        output: job.outputJson ? JSON.parse(job.outputJson) : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/jobs', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const jobs = await prisma.mediaJob.findMany({
      where: req.query.streamId ? { streamId: String(req.query.streamId) } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
});

export default router;
