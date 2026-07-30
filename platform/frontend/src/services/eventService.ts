import { DEFAULT_EVENT, MOCK_ANALYTICS } from '@/constants/eventPortal'
import type { EventAnalytics, EventFormValues, EventPayload } from '@/types/event'

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

// ponytail: in-memory mock until /api/events is wired
let store: EventPayload = { ...DEFAULT_EVENT, id: 'evt_demo', updatedAt: new Date().toISOString() }

export async function fetchEvent(id = 'evt_demo'): Promise<EventPayload> {
  await delay()
  return { ...store, id }
}

export async function saveEvent(data: EventFormValues, as: 'draft' | 'publish' = 'draft'): Promise<EventPayload> {
  await delay(600)
  store = {
    ...data,
    id: store.id ?? 'evt_demo',
    status: as === 'publish' ? 'published' : data.status === 'published' ? 'published' : 'draft',
    updatedAt: new Date().toISOString(),
  }
  return store
}

export async function duplicateEvent(): Promise<EventPayload> {
  await delay()
  store = {
    ...store,
    id: `evt_${Date.now()}`,
    name: `${store.name} (Copy)`,
    slug: `${store.slug}-copy`,
    status: 'draft',
    updatedAt: new Date().toISOString(),
  }
  return store
}

export async function deleteEvent(): Promise<void> {
  await delay()
  store = { ...DEFAULT_EVENT, id: 'evt_demo', status: 'draft', updatedAt: new Date().toISOString() }
}

export async function fetchAnalytics(): Promise<EventAnalytics> {
  await delay(300)
  return MOCK_ANALYTICS
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  await delay(250)
  return !['taken', 'admin', 'login'].includes(slug)
}
