/**
 * GPU worker contract — queue-compatible job envelopes for vision / STT / highlights.
 * Existing AiJob table remains the source of truth; workers pull via /api/ai/workers/claim
 */

export const GPU_WORKER_CAPABILITIES = [
  'FACE_RECOGNITION',
  'PERSON_TRACKING',
  'OBJECT_DETECTION',
  'CROWD_DETECTION',
  'EMOTION_DETECTION',
  'SCENE_DETECTION',
  'SPEECH_TRANSCRIPTION',
  'AUTO_SUBTITLES',
  'HIGHLIGHT_GENERATION',
  'REEL_GENERATION',
  'WEDDING_TIMELINE',
] as const;

export type GpuCapability = (typeof GPU_WORKER_CAPABILITIES)[number];

export type GpuJobEnvelope = {
  jobId: string;
  capability: GpuCapability;
  streamId?: string | null;
  recordingId?: string | null;
  input: Record<string, unknown>;
  callbackPath: string;
};

export function mapAiTypeToCapability(type: string): GpuCapability {
  const map: Record<string, GpuCapability> = {
    DIRECTOR: 'SCENE_DETECTION',
    FACE_TRACK: 'FACE_RECOGNITION',
    STT: 'SPEECH_TRANSCRIPTION',
    HIGHLIGHT: 'HIGHLIGHT_GENERATION',
    REEL: 'REEL_GENERATION',
    WEDDING_TIMELINE: 'WEDDING_TIMELINE',
    CROWD: 'CROWD_DETECTION',
    EMOTION: 'EMOTION_DETECTION',
    OBJECT: 'OBJECT_DETECTION',
    PERSON: 'PERSON_TRACKING',
  };
  return map[type] || 'SCENE_DETECTION';
}

export function buildTimestampMetadata(clips: Array<{ title: string; startSec: number; endSec: number }>) {
  return clips.map((c) => ({
    ...c,
    id: `${c.title.toLowerCase().replace(/\s+/g, '_')}_${c.startSec}`,
    confidence: 0.82,
  }));
}
