import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export type AiJobType =
  | 'DIRECTOR'
  | 'HIGHLIGHT'
  | 'STT'
  | 'FACE_TRACK'
  | 'REEL'
  | 'WEDDING_TIMELINE'
  | 'CROWD'
  | 'EMOTION'
  | 'OBJECT'
  | 'PERSON';

const HIGHLIGHT_TEMPLATES: Record<string, string[]> = {
  Wedding: ['Bride Entry', 'Ring Exchange', 'Mangalsutra', 'Reception', 'First Dance', 'Cake Cutting'],
  Temple: ['Temple Aarathi', 'Alankaram', 'Harathi', 'Prasadam'],
  Corporate: ['Corporate Keynote', 'Q&A', 'Panel', 'Closing'],
  Concert: ['Opening Act', 'Headline Set', 'Encore'],
  Funeral: ['Eulogy', 'Remembrance', 'Procession'],
  default: ['Opening', 'Peak Moment', 'Closing'],
};

/** Queue an AI job; local runner simulates completion for demo. */
export async function enqueueAiJob(opts: {
  type: AiJobType;
  streamId?: string;
  recordingId?: string;
  input?: Record<string, unknown>;
}) {
  const job = await prisma.aiJob.create({
    data: {
      type: opts.type,
      streamId: opts.streamId,
      recordingId: opts.recordingId,
      status: 'QUEUED',
      inputJson: JSON.stringify(opts.input || {}),
    },
  });

  // Fire-and-forget local processor (replace with worker queue in prod)
  setTimeout(() => void processAiJob(job.id), 800);
  return job;
}

async function processAiJob(id: string) {
  try {
    await prisma.aiJob.update({
      where: { id },
      data: { status: 'RUNNING', startedAt: new Date() },
    });
    const job = await prisma.aiJob.findUnique({ where: { id }, include: { stream: true } });
    if (!job) return;

    let output: Record<string, unknown> = {};

    if (job.type === 'DIRECTOR') {
      output = {
        recommendation: 'CAM_2',
        reason: 'Speaker / face prominence detected',
        detections: ['speaker', 'audience', 'applause'],
        autoZoom: 1.15,
        switchedAt: new Date().toISOString(),
      };
      if (job.streamId) {
        await prisma.studioState.upsert({
          where: { streamId: job.streamId },
          create: { streamId: job.streamId, aiDirectorOn: true, sceneName: 'AI Auto' },
          update: { aiDirectorOn: true, sceneName: 'AI Auto' },
        });
      }
    } else if (job.type === 'HIGHLIGHT' || job.type === 'REEL') {
      const eventType = job.stream?.eventType || 'default';
      const clips = (HIGHLIGHT_TEMPLATES[eventType] || HIGHLIGHT_TEMPLATES.default).map((title, i) => ({
        title,
        startSec: i * 90,
        endSec: i * 90 + 45,
        aspect: job.type === 'REEL' ? '9:16' : '16:9',
        platforms: job.type === 'REEL' ? ['Instagram', 'YouTube Shorts', 'Reels'] : ['YouTube', 'Website'],
      }));
      output = { clips, reelUrl: null, note: 'Demo highlight markers — wire FFmpeg/ML in workers' };
    } else if (job.type === 'STT') {
      const lang = (JSON.parse(job.inputJson || '{}') as { language?: string }).language || 'en';
      const sample =
        lang === 'te'
          ? 'శుభాకాంక్షలు — వివాహ వేడుక ప్రారంభమైంది.'
          : lang === 'hi'
            ? 'शुभकामनाएँ — समारोह शुरू हो गया है।'
            : 'Welcome everyone. The ceremony is about to begin.';
      const vtt = `WEBVTT\n\n00:00:01.000 --> 00:00:05.000\n${sample}\n`;
      if (job.streamId) {
        await prisma.subtitleTrack.create({
          data: {
            streamId: job.streamId,
            language: lang,
            format: 'VTT',
            content: vtt,
          },
        });
      }
      output = { language: lang, format: 'VTT', lines: 1 };
    } else if (job.type === 'FACE_TRACK' || job.type === 'PERSON' || job.type === 'OBJECT' || job.type === 'CROWD' || job.type === 'EMOTION') {
      output = {
        faces: [
          { label: 'Bride', confidence: 0.91, box: [120, 80, 220, 280] },
          { label: 'Groom', confidence: 0.88, box: [340, 90, 220, 270] },
        ],
        persons: 2,
        objects: ['mandap', 'flowers'],
        crowdDensity: job.type === 'CROWD' ? 0.62 : 0.2,
        emotion: job.type === 'EMOTION' ? 'joy' : 'neutral',
        smile: true,
        applause: false,
      };
    } else if (job.type === 'WEDDING_TIMELINE') {
      output = {
        clips: [
          { title: 'Bride Entry', startSec: 120, endSec: 240 },
          { title: 'Ring Exchange', startSec: 900, endSec: 1020 },
          { title: 'Mangalsutra', startSec: 1100, endSec: 1250 },
          { title: 'First Dance', startSec: 3600, endSec: 3780 },
        ],
      };
    }

    await prisma.aiJob.update({
      where: { id },
      data: {
        status: 'DONE',
        finishedAt: new Date(),
        outputJson: JSON.stringify(output),
      },
    });
  } catch (err) {
    logger.error(`AI job ${id} failed: ${(err as Error).message}`);
    await prisma.aiJob.update({
      where: { id },
      data: { status: 'FAILED', error: (err as Error).message, finishedAt: new Date() },
    });
  }
}
