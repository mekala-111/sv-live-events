import { DEFAULT_EVENT } from '@/constants/eventPortal'
import { api } from '@/lib/api'
import type { EventAnalytics, EventFormValues, EventPayload } from '@/types/event'

interface Envelope<T> {
  success: boolean
  data: T
}

type StreamRow = {
  id: string
  title: string
  slug: string
  eventType: string
  description?: string | null
  rtmpUrl: string
  streamKey: string
  status: string
  isRecording: boolean
  scheduledAt?: string | null
  updatedAt?: string
  viewerUrl?: string
  currentViewers?: number
  peakViewers?: number
}

type DescJson = Record<string, unknown> & { portal?: Partial<EventFormValues> }

function parseDesc(description?: string | null): DescJson {
  if (!description) return {}
  try {
    return JSON.parse(description) as DescJson
  } catch {
    return {}
  }
}

function toLocalInput(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function mapStatus(streamStatus: string, portalStatus?: EventFormValues['status']): EventFormValues['status'] {
  if (portalStatus) return portalStatus
  if (streamStatus === 'ARCHIVED') return 'archived'
  if (streamStatus === 'SCHEDULED') return 'scheduled'
  if (streamStatus === 'LIVE' || streamStatus === 'ENDED') return 'published'
  return 'draft'
}

export function streamToForm(stream: StreamRow): EventPayload {
  const desc = parseDesc(stream.description)
  const portal = cleanPortalImages(desc.portal ?? {})
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const designId = String(desc.designId || portal.websiteDesignId || portal.themeId || DEFAULT_EVENT.websiteDesignId)
  const serviceType = desc.service === 'youtube' || desc.youtubeLiveUrl || portal.serviceType === 'youtube' ? 'youtube' : DEFAULT_EVENT.serviceType
  return {
    ...DEFAULT_EVENT,
    ...portal,
    assets: { ...DEFAULT_EVENT.assets, ...(portal.assets ?? {}) },
    socials: { ...DEFAULT_EVENT.socials, ...(portal.socials ?? {}) },
    features: { ...DEFAULT_EVENT.features, ...(portal.features ?? {}) },
    registrationFields: portal.registrationFields ?? DEFAULT_EVENT.registrationFields,
    keywords: portal.keywords ?? DEFAULT_EVENT.keywords,
    id: stream.id,
    serviceType,
    name: stream.title,
    slug: stream.slug,
    category: stream.eventType || portal.category || 'Marriage',
    themeId: designId,
    websiteDesignId: designId,
    eventDate:
      portal.eventDate ||
      (stream.scheduledAt ? toLocalInput(stream.scheduledAt).slice(0, 10) : DEFAULT_EVENT.eventDate),
    liveTimings: String(desc.liveTimings || portal.liveTimings || DEFAULT_EVENT.liveTimings),
    youtubeChannel: String(desc.youtubeChannel || portal.youtubeChannel || ''),
    youtubeLiveUrl: String(desc.youtubeLiveUrl || portal.youtubeLiveUrl || ''),
    youtubeLiveKey: String(desc.youtubeLiveKey || portal.youtubeLiveKey || ''),
    teaserUrl: String(desc.teaserUrl || portal.teaserUrl || ''),
    scrollMessage: String(desc.scrollMessage || portal.scrollMessage || ''),
    watchLiveButton: desc.watchLiveButton !== undefined ? Boolean(desc.watchLiveButton) : portal.watchLiveButton ?? true,
    socialShare: desc.socialShare !== undefined ? Boolean(desc.socialShare) : portal.socialShare ?? true,
    whatsappNumber: String(desc.whatsappNumber || portal.whatsappNumber || ''),
    remarks1: String(desc.remarks1 || portal.remarks1 || ''),
    remarks2: String(desc.remarks2 || portal.remarks2 || ''),
    fontStyle: String(desc.fontStyle || portal.fontStyle || DEFAULT_EVENT.fontStyle),
    fontColor: String(desc.fontColor || portal.fontColor || DEFAULT_EVENT.fontColor),
    pin: portal.pin || stream.streamKey?.replace(/\D/g, '').slice(0, 4) || DEFAULT_EVENT.pin,
    eventImages: portal.eventImages ?? DEFAULT_EVENT.eventImages,
    logo: portal.logo ?? DEFAULT_EVENT.logo,
    customImage: portal.customImage ?? DEFAULT_EVENT.customImage,
    whatsappImage: portal.whatsappImage ?? DEFAULT_EVENT.whatsappImage,
    rtmpUrl: stream.rtmpUrl || portal.rtmpUrl || DEFAULT_EVENT.rtmpUrl,
    streamKey: stream.streamKey || portal.streamKey || '',
    autoRecording: stream.isRecording,
    startDate: toLocalInput(stream.scheduledAt) || portal.startDate || '',
    status: mapStatus(stream.status, portal.status),
    invitationLink: stream.viewerUrl || portal.invitationLink || `${origin}/live/${stream.slug}`,
    updatedAt: stream.updatedAt,
  }
}

export async function listEvents(): Promise<StreamRow[]> {
  const res = await api.get<Envelope<StreamRow[]>>('/stream/events')
  return res.data.data
}

export async function fetchEvent(id: string): Promise<EventPayload> {
  const res = await api.get<Envelope<StreamRow>>(`/stream/events/${id}`)
  return streamToForm(res.data.data)
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || `event${Date.now().toString(36)}`
}

function persistUrl(url: string | null | undefined) {
  if (!url || url.startsWith('blob:')) return null
  return url
}

function cleanPortalImages<T extends Partial<EventFormValues>>(portal: T): T {
  return {
    ...portal,
    eventImages: (portal.eventImages ?? []).map(persistUrl).filter((u): u is string => Boolean(u)),
    logo: persistUrl(portal.logo) ?? null,
    customImage: persistUrl(portal.customImage) ?? null,
    whatsappImage: persistUrl(portal.whatsappImage) ?? null,
  }
}

function toPortal(data: EventFormValues, as: 'draft' | 'publish', slug: string, password: string) {
  return {
    serviceType: 'youtube' as const,
    eventDate: data.eventDate,
    category: data.category,
    themeId: data.websiteDesignId || data.themeId,
    websiteDesignId: data.websiteDesignId || data.themeId,
    name: data.name,
    slug,
    rememberChoice: data.rememberChoice,
    liveTimings: data.liveTimings,
    bookingEnabled: data.bookingEnabled,
    youtubeChannel: data.youtubeChannel,
    youtubeLiveUrl: data.youtubeLiveUrl,
    youtubeLiveKey: data.youtubeLiveKey,
    teaserUrl: data.teaserUrl,
    scrollMessage: data.scrollMessage,
    eventImages: (data.eventImages ?? []).map(persistUrl).filter((u): u is string => Boolean(u)),
    logo: persistUrl(data.logo),
    customImage: persistUrl(data.customImage),
    whatsappImage: persistUrl(data.whatsappImage),
    watchLiveButton: data.watchLiveButton,
    socialShare: data.socialShare,
    whatsappNumber: data.whatsappNumber,
    remarks1: data.remarks1,
    remarks2: data.remarks2,
    fontStyle: data.fontStyle,
    fontColor: data.fontColor,
    pin: data.pin,
    status: (as === 'publish' ? 'published' : 'draft') as EventFormValues['status'],
    guestPassword: password,
  }
}

function toWebsiteConfig(portal: ReturnType<typeof toPortal>) {
  return {
    service: 'youtube',
    designId: portal.websiteDesignId,
    designName: portal.websiteDesignId,
    liveTimings: portal.liveTimings,
    domainName: portal.slug,
    youtubeChannel: portal.youtubeChannel,
    youtubeLiveUrl: portal.youtubeLiveUrl,
    youtubeLiveKey: portal.youtubeLiveKey,
    teaserUrl: portal.teaserUrl,
    scrollMessage: portal.scrollMessage,
    watchLiveButton: portal.watchLiveButton,
    socialShare: portal.socialShare,
    whatsappNumber: portal.whatsappNumber,
    remarks1: portal.remarks1,
    remarks2: portal.remarks2,
    fontStyle: portal.fontStyle,
    fontColor: portal.fontColor,
    portal,
  }
}

export async function saveEvent(
  data: EventFormValues,
  as: 'draft' | 'publish' = 'draft',
  id?: string,
): Promise<EventPayload> {
  const slug = data.slug?.trim() || slugify(data.name)
  const password = data.pin?.trim().length >= 4 ? data.pin.trim() : `1234`
  const scheduledAt = data.eventDate ? new Date(`${data.eventDate}T00:00:00`).toISOString() : null
  const portal = toPortal(data, as, slug, password)
  const website = toWebsiteConfig(portal)

  if (!id) {
    const res = await api.post<Envelope<StreamRow>>('/stream/events', {
      title: data.name.trim() || 'Untitled Event',
      eventType: data.category || 'Marriage',
      description: JSON.stringify(website),
      scheduledAt: scheduledAt || undefined,
      isRecording: false,
      password,
      slug,
    })
    const created = res.data.data
    if (as === 'publish') {
      const patched = await api.patch<Envelope<StreamRow>>(`/stream/events/${created.id}`, {
        publish: true,
        portal,
      })
      return streamToForm(patched.data.data)
    }
    return streamToForm(created)
  }

  const res = await api.patch<Envelope<StreamRow>>(`/stream/events/${id}`, {
    title: data.name.trim() || 'Untitled Event',
    eventType: data.category || 'Marriage',
    slug,
    scheduledAt,
    isRecording: false,
    password,
    portal,
    publish: as === 'publish',
  })
  return streamToForm(res.data.data)
}

export async function duplicateEvent(id: string): Promise<EventPayload> {
  const source = await fetchEvent(id)
  const slug = `${source.slug}-copy`.slice(0, 48)
  return saveEvent(
    {
      ...source,
      name: `${source.name} (Copy)`,
      slug,
      status: 'draft',
    },
    'draft',
  )
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/stream/events/${id}`)
}

export async function fetchAnalytics(id: string): Promise<EventAnalytics> {
  const res = await api.get<Envelope<{
    currentViewers: number
    peakViewers: number
    byDevice?: Record<string, number>
  }>>(`/stream/analytics/${id}`)
  const d = res.data.data
  const byDevice = d.byDevice || {}
  const entries = Object.entries(byDevice)
  const total = entries.reduce((s, [, n]) => s + n, 0) || 1
  const colors = ['#F7B733', '#FF8A00', '#38bdf8', '#64748b']
  return {
    expectedViewers: d.peakViewers || 0,
    currentViewers: d.currentViewers || 0,
    currentViewersDelta: 0,
    revenue: 0,
    packagesSold: 0,
    trafficSources: entries.slice(0, 4).map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 100),
      color: colors[i % colors.length],
    })),
  }
}

export async function checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const events = await listEvents()
  return !events.some((e) => e.slug === slug && e.id !== excludeId)
}
