import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export type MediaJobType = 'TRANSCODE' | 'THUMBNAILS' | 'PREVIEW' | 'POSTER' | 'WAVEFORM' | 'ABR_HLS';

const RENDITIONS = [
  { height: 240, bitrate: '400k' },
  { height: 360, bitrate: '800k' },
  { height: 480, bitrate: '1400k' },
  { height: 720, bitrate: '2800k' },
  { height: 1080, bitrate: '5000k' },
  { height: 2160, bitrate: '15000k', label: '4K' },
];

export async function enqueueMediaJob(opts: {
  type: MediaJobType;
  streamId?: string;
  recordingId?: string;
  input?: Record<string, unknown>;
}) {
  const job = await prisma.mediaJob.create({
    data: {
      type: opts.type,
      streamId: opts.streamId,
      recordingId: opts.recordingId,
      status: 'QUEUED',
      inputJson: JSON.stringify(opts.input || {}),
    },
  });
  setTimeout(() => void processMediaJob(job.id), 600);
  return job;
}

async function processMediaJob(id: string) {
  try {
    await prisma.mediaJob.update({
      where: { id },
      data: { status: 'RUNNING', startedAt: new Date(), workerId: `ffmpeg-local-${process.pid}` },
    });
    const job = await prisma.mediaJob.findUnique({ where: { id } });
    if (!job) return;

    const input = JSON.parse(job.inputJson || '{}') as {
      sourceUrl?: string;
      thumbIntervalSec?: number;
    };
    let output: Record<string, unknown> = {};

    if (job.type === 'ABR_HLS' || job.type === 'TRANSCODE') {
      output = {
        masterPlaylist: `${input.sourceUrl || 'stream'}/master.m3u8`,
        variants: RENDITIONS.map((r) => ({
          height: r.height,
          bitrate: r.bitrate,
          playlist: `${r.height}p.m3u8`,
          label: 'label' in r ? r.label : `${r.height}p`,
        })),
        ffmpegHint:
          'ffmpeg -i $IN -filter_complex "[0:v]split=6[v0][v1]..." -map ... -f hls master.m3u8',
      };
    } else if (job.type === 'THUMBNAILS') {
      const interval = input.thumbIntervalSec || 10;
      output = {
        intervalSec: interval,
        thumbs: Array.from({ length: 6 }).map((_, i) => ({
          t: i * interval,
          url: `thumbs/frame_${String(i).padStart(4, '0')}.jpg`,
        })),
      };
    } else if (job.type === 'PREVIEW') {
      output = { previewGif: 'preview/animated.webp', durationSec: 3 };
    } else if (job.type === 'POSTER') {
      output = { posterUrl: 'poster/poster.jpg', atSec: 5 };
    } else if (job.type === 'WAVEFORM') {
      output = {
        peaks: Array.from({ length: 64 }).map((_, i) => Math.abs(Math.sin(i / 3)) * 0.8),
        sampleRate: 100,
      };
    }

    await prisma.mediaJob.update({
      where: { id },
      data: { status: 'DONE', finishedAt: new Date(), outputJson: JSON.stringify(output) },
    });
  } catch (err) {
    logger.error(`Media job ${id} failed: ${(err as Error).message}`);
    await prisma.mediaJob.update({
      where: { id },
      data: { status: 'FAILED', error: (err as Error).message, finishedAt: new Date() },
    });
  }
}

export { RENDITIONS };
