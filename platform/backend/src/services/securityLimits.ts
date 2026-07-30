import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { hashIp } from '../utils/streaming.js';

/** Concurrent session + device limits + optional geo allow/block */
export async function assertViewerAccess(opts: {
  streamId: string;
  sessionToken?: string;
  ip?: string;
  country?: string;
  deviceId?: string;
}) {
  const stream = await prisma.stream.findUnique({ where: { id: opts.streamId } });
  if (!stream) throw new AppError('Stream not found', 404);

  if (stream.geoAllow) {
    const allow = stream.geoAllow.split(',').map((s) => s.trim().toUpperCase());
    if (opts.country && !allow.includes(opts.country.toUpperCase())) {
      throw new AppError('Streaming not available in your region', 403);
    }
  }
  if (stream.geoBlock) {
    const block = stream.geoBlock.split(',').map((s) => s.trim().toUpperCase());
    if (opts.country && block.includes(opts.country.toUpperCase())) {
      throw new AppError('Streaming blocked in your region', 403);
    }
  }

  const active = await prisma.viewerSession.count({
    where: { streamId: opts.streamId, leftAt: null },
  });
  if (active >= stream.maxConcurrent) {
    throw new AppError('Concurrent viewer limit reached', 429);
  }

  if (opts.deviceId) {
    const devices = await prisma.viewerSession.findMany({
      where: { streamId: opts.streamId, leftAt: null, ipHash: hashIp(opts.deviceId) },
    });
    if (devices.length >= stream.maxDevices) {
      throw new AppError('Device limit reached for this event', 429);
    }
  }

  return stream;
}

export function fingerprintSession(parts: {
  ua?: string;
  ip?: string;
  lang?: string;
}) {
  const raw = `${parts.ua || ''}|${parts.ip || ''}|${parts.lang || ''}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
  return `fp_${Math.abs(h).toString(36)}`;
}
