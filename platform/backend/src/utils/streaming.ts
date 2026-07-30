import { customAlphabet } from 'nanoid';
import crypto from 'crypto';
import { generatePublisherToken } from './streamLifecycle.js';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);

const keyId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);
const passId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export function buildStreamCredentials(title: string) {
  const base = slugify(title) || 'event';
  const year = new Date().getFullYear();
  const slug = `${base}-${year}-${keyId().slice(0, 4)}`;
  const streamKey = `${base.replace(/-/g, '_')}_${year}_${keyId()}`;
  const password = `Event@${passId()}`;

  const rtmpBase = process.env.RTMP_BASE_URL || 'rtmp://localhost:1935/live';
  const hlsBase = process.env.HLS_BASE_URL || 'http://localhost:8080/live';
  const webrtcBase = process.env.WEBRTC_BASE_URL || 'webrtc://localhost:1985/live';
  const viewerBase = process.env.CLIENT_URL || 'http://localhost:5173';

  return {
    slug,
    streamKey,
    password,
    publisherToken: generatePublisherToken(),
    rtmpUrl: rtmpBase,
    hlsUrl: `${hlsBase}/${streamKey}.m3u8`,
    webrtcUrl: `${webrtcBase}/${streamKey}`,
    viewerUrl: `${viewerBase}/live/${slug}`,
  };
}

export function signPlaybackToken(payload: {
  streamId: string;
  slug: string;
  sessionToken: string;
}) {
  const secret = process.env.JWT_ACCESS_SECRET || 'svlive-access-secret';
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 6; // 6 hours
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp, typ: 'playback' }),
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyPlaybackToken(token: string) {
  const secret = process.env.JWT_ACCESS_SECRET || 'svlive-access-secret';
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (expected !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      streamId: string;
      slug: string;
      sessionToken: string;
      exp: number;
      typ: string;
    };
    if (data.typ !== 'playback' || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function hashIp(ip?: string) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 24);
}
