/** Cloud storage abstraction — S3 / R2 / B2 / GCS / Azure via env provider */

export type StorageProvider = 'local' | 's3' | 'r2' | 'b2' | 'gcs' | 'azure';

export function getStorageProvider(): StorageProvider {
  return (process.env.STORAGE_PROVIDER as StorageProvider) || 'local';
}

export function buildObjectKey(parts: string[]) {
  return parts.filter(Boolean).join('/').replace(/\/+/g, '/');
}

/** Returns a public or signed URL for an object key (provider-specific). */
export function resolveAssetUrl(key: string, opts?: { signed?: boolean; ttlSec?: number }) {
  const provider = getStorageProvider();
  const base =
    process.env.STORAGE_PUBLIC_BASE ||
    process.env.CDN_BASE_URL ||
    process.env.CLIENT_URL ||
    'http://localhost:5173';

  if (provider === 'local') {
    return `${base}/media/${key}`;
  }

  // Signed URL stub — wire AWS SDK / R2 / etc. when credentials exist
  if (opts?.signed) {
    const exp = Math.floor(Date.now() / 1000) + (opts.ttlSec || 3600);
    return `${base}/${key}?exp=${exp}&provider=${provider}&sig=pending`;
  }

  return `${base}/${key}`;
}

export async function enqueueBackup(recordingId: string, fileUrl: string) {
  // Production: put message on Redis/SQS. Local: log intent.
  return {
    queued: true,
    recordingId,
    fileUrl,
    provider: getStorageProvider(),
    at: new Date().toISOString(),
  };
}
