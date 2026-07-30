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
  const portal = desc.portal ?? {}
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return {
    ...DEFAULT_EVENT,
    ...portal,
    assets: { ...DEFAULT_EVENT.assets, ...(portal.assets ?? {}) },
    socials: { ...DEFAULT_EVENT.socials, ...(portal.socials ?? {}) },
    features: { ...DEFAULT_EVENT.features, ...(portal.features ?? {}) },
    registrationFields: portal.registrationFields ?? DEFAULT_EVENT.registrationFields,
    keywords: portal.keywords ?? DEFAULT_EVENT.keywords,
    id: stream.id,
    name: stream.title,
    slug: stream.slug,
    category: (stream.eventType || portal.category || 'wedding').toLowerCase(),
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
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || `event-${Date.now().toString(36)}`
}

export async function saveEvent(
  data: EventFormValues,
  as: 'draft' | 'publish' = 'draft',
  id?: string,
): Promise<EventPayload> {
  const slug = data.slug?.trim() || slugify(data.name)
  const password = data.guestPassword?.trim().length >= 4 ? data.guestPassword.trim() : `guest${Date.now().toString(36).slice(-6)}`
  const scheduledAt = data.startDate ? new Date(data.startDate).toISOString() : null
  const portal = {
    ...data,
    slug,
    guestPassword: password,
    status: (as === 'publish' ? 'published' : data.status === 'published' ? 'published' : 'draft') as EventFormValues['status'],
  }

  if (!id) {
    const desc = { portal, designId: data.themeId }
    const res = await api.post<Envelope<StreamRow>>('/stream/events', {
      title: data.name.trim() || 'Untitled Event',
      eventType: data.category || 'wedding',
      description: JSON.stringify(desc),
      scheduledAt: scheduledAt || undefined,
      isRecording: data.autoRecording,
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
    eventType: data.category || 'wedding',
    slug,
    scheduledAt,
    isRecording: data.autoRecording,
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
