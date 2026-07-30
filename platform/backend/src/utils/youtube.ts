/** Shared YouTube helpers for V1 event websites (API + frontend) */

export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;

      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] === 'live' || parts[0] === 'embed' || parts[0] === 'shorts') {
        const id = parts[1];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export type WebsiteConfig = {
  service?: string;
  designId?: string;
  designName?: string;
  liveTimings?: string;
  domainName?: string;
  youtubeChannel?: string;
  youtubeLiveUrl?: string;
  youtubeLiveKey?: string;
  teaserUrl?: string;
  scrollMessage?: string;
  watchLiveButton?: boolean;
  socialShare?: boolean;
  whatsappNumber?: string;
  remarks1?: string;
  remarks2?: string;
  fontStyle?: string;
  fontColor?: string;
};

export function parseWebsiteConfig(description?: string | null): WebsiteConfig | null {
  if (!description) return null;
  try {
    const parsed = JSON.parse(description) as WebsiteConfig;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isYouTubeEvent(config: WebsiteConfig | null | undefined): boolean {
  return Boolean(config?.service === 'youtube' || config?.youtubeLiveUrl);
}
