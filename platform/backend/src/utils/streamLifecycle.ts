import crypto from 'crypto';
import { customAlphabet } from 'nanoid';

const keyId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

export type LifecycleState =
  | 'SCHEDULED'
  | 'WAITING'
  | 'STARTING_SOON'
  | 'LIVE'
  | 'PAUSED'
  | 'OFFLINE'
  | 'ENDED'
  | 'ARCHIVED';

type StreamLike = {
  status: string;
  scheduledAt?: Date | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  pausedAt?: Date | null;
  ingestActive?: boolean;
  lastHeartbeatAt?: Date | null;
};

export function computeLifecycle(stream: StreamLike, now = new Date()): LifecycleState {
  if (stream.status === 'ARCHIVED') return 'ARCHIVED';
  if (stream.status === 'ENDED' || stream.endedAt) return 'ENDED';
  if (stream.status === 'PAUSED' || stream.pausedAt) return 'PAUSED';

  if (stream.status === 'LIVE') {
    if (stream.ingestActive) return 'LIVE';
    // Publisher dropped but event still marked live
    if (stream.lastHeartbeatAt) {
      const age = now.getTime() - stream.lastHeartbeatAt.getTime();
      if (age > 20_000) return 'OFFLINE';
    }
    return stream.ingestActive === false ? 'OFFLINE' : 'LIVE';
  }

  if (stream.scheduledAt) {
    const ms = stream.scheduledAt.getTime() - now.getTime();
    if (ms > 15 * 60_000) return 'WAITING';
    if (ms > 0) return 'STARTING_SOON';
    return 'WAITING';
  }

  return (stream.status as LifecycleState) || 'SCHEDULED';
}

export function generatePublisherToken() {
  return `pub_${keyId()}${keyId()}`;
}

export function regenerateStreamKey(existingSlugBase: string) {
  const clean = existingSlugBase.replace(/[^a-z0-9_]/gi, '_').slice(0, 40);
  return `${clean}_${Date.now().toString(36)}_${keyId()}`;
}

/** Short-lived signed HLS URL query params (replay protection via nonce + exp) */
export function signHlsUrl(hlsUrl: string, streamId: string, sessionToken: string) {
  const secret = process.env.JWT_ACCESS_SECRET || 'svlive-access-secret';
  const exp = Math.floor(Date.now() / 1000) + 60 * 30; // 30 min
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = `${streamId}.${sessionToken}.${exp}.${nonce}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const sep = hlsUrl.includes('?') ? '&' : '?';
  return `${hlsUrl}${sep}exp=${exp}&nonce=${nonce}&sig=${sig}`;
}

const BAD_WORDS = ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'cunt'];

export function filterProfanity(input: string) {
  let cleaned = input;
  for (const word of BAD_WORDS) {
    const re = new RegExp(word, 'gi');
    cleaned = cleaned.replace(re, '*'.repeat(word.length));
  }
  return cleaned;
}

export function isGifUrl(url: string) {
  return /^https?:\/\/.+\.(gif|webp)(\?.*)?$/i.test(url) || url.includes('giphy.com') || url.includes('tenor.com');
}
