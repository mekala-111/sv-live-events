import crypto from 'crypto';
import { signHlsUrl } from '../utils/streamLifecycle.js';

/** Extends existing HLS signing with segment token + rotation helpers (additive) */
export function signMediaSegment(opts: {
  streamId: string;
  sessionToken: string;
  segmentPath: string;
  ttlSec?: number;
}) {
  const secret = process.env.JWT_ACCESS_SECRET || 'svlive-access-secret';
  const exp = Math.floor(Date.now() / 1000) + (opts.ttlSec || 120);
  const nonce = crypto.randomBytes(6).toString('hex');
  const payload = `${opts.streamId}.${opts.sessionToken}.${opts.segmentPath}.${exp}.${nonce}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const sep = opts.segmentPath.includes('?') ? '&' : '?';
  return `${opts.segmentPath}${sep}exp=${exp}&nonce=${nonce}&ssig=${sig}`;
}

export function verifyMediaSignature(opts: {
  streamId: string;
  sessionToken: string;
  path: string;
  exp: string;
  nonce: string;
  sig: string;
  kind: 'hls' | 'segment';
}) {
  const secret = process.env.JWT_ACCESS_SECRET || 'svlive-access-secret';
  const expN = Number(opts.exp);
  if (!expN || expN < Math.floor(Date.now() / 1000)) return false;
  const basePath = opts.path.split('?')[0];
  const payload =
    opts.kind === 'segment'
      ? `${opts.streamId}.${opts.sessionToken}.${basePath}.${expN}.${opts.nonce}`
      : `${opts.streamId}.${opts.sessionToken}.${expN}.${opts.nonce}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(opts.sig));
  } catch {
    return false;
  }
}

export function rotatePlaybackUrl(hlsUrl: string, streamId: string, sessionToken: string) {
  // Strip prior query, resign — token rotation
  const base = hlsUrl.split('?')[0];
  return signHlsUrl(base, streamId, sessionToken);
}

export function buildViewerWatermark(opts: {
  name?: string;
  email?: string;
  ipHash?: string | null;
  sessionId: string;
}) {
  return {
    lines: [
      opts.name || 'Guest',
      opts.email || '',
      opts.ipHash ? `ip:${opts.ipHash.slice(0, 8)}` : '',
      `sid:${opts.sessionId.slice(0, 10)}`,
    ].filter(Boolean),
    opacity: 0.14,
    rotateDeg: -18,
  };
}

export function bindSessionFingerprint(fingerprint: string, sessionToken: string) {
  const secret = process.env.JWT_ACCESS_SECRET || 'svlive-access-secret';
  return crypto.createHmac('sha256', secret).update(`${fingerprint}.${sessionToken}`).digest('hex');
}
