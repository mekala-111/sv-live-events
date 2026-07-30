/** CDN abstraction — Cloudflare / Bunny / CloudFront */

export type CdnProvider = 'none' | 'cloudflare' | 'bunny' | 'cloudfront';

export function getCdnProvider(): CdnProvider {
  return (process.env.CDN_PROVIDER as CdnProvider) || 'none';
}

export function edgeUrl(originPath: string, geo?: string) {
  const cdn = process.env.CDN_BASE_URL;
  if (!cdn) return originPath;
  const path = originPath.replace(/^https?:\/\/[^/]+/, '');
  const region = geo ? `/${geo.toLowerCase()}` : '';
  return `${cdn.replace(/\/$/, '')}${region}${path.startsWith('/') ? path : `/${path}`}`;
}

export function cacheHeaders(ttlSec = 30) {
  return {
    'Cache-Control': `public, max-age=${ttlSec}, s-maxage=${ttlSec * 2}`,
    'CDN-Cache-Control': `max-age=${ttlSec * 2}`,
    'X-SVLive-CDN': getCdnProvider(),
  };
}

export function originFailover(primary: string, secondary?: string) {
  return {
    primary,
    secondary: secondary || process.env.HLS_FAILOVER_URL || primary,
    strategy: 'active-passive' as const,
  };
}
