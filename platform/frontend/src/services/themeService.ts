import { api } from '@/lib/api'
import type { EventThemeRecord, ThemeFormValues } from '@/types/theme'

interface Envelope<T> {
  success: boolean
  data: T
  message?: string
}

function toPayload(form: ThemeFormValues) {
  const { customFonts, layers, gradientColors, ...rest } = form
  return {
    ...rest,
    gradientColors: JSON.stringify(gradientColors ?? []),
    customFontsJson: JSON.stringify(customFonts ?? []),
    layersJson: JSON.stringify(layers ?? []),
    assets: (form.assets ?? []).map((a, i) => ({
      ...a,
      sortOrder: a.sortOrder ?? i,
      metaJson: a.metaJson ?? (a.meta ? JSON.stringify(a.meta) : null),
    })),
  }
}

export async function listThemes(params?: { status?: string; category?: string; q?: string }) {
  const res = await api.get<Envelope<EventThemeRecord[]>>('/themes', { params })
  return res.data.data
}

export async function listPublishedThemes(category?: string) {
  const res = await api.get<Envelope<EventThemeRecord[]>>('/themes/public', {
    params: category ? { category } : undefined,
  })
  return res.data.data
}

export async function getPublishedTheme(slugOrId: string) {
  const res = await api.get<Envelope<EventThemeRecord>>(`/themes/public/${slugOrId}`)
  return res.data.data
}

export async function getTheme(id: string) {
  const res = await api.get<Envelope<EventThemeRecord>>(`/themes/${id}`)
  return res.data.data
}

export async function createTheme(form: ThemeFormValues) {
  const res = await api.post<Envelope<EventThemeRecord>>('/themes', toPayload(form))
  return res.data.data
}

export async function updateTheme(id: string, form: ThemeFormValues) {
  const res = await api.put<Envelope<EventThemeRecord>>(`/themes/${id}`, toPayload(form))
  return res.data.data
}

export async function setThemeStatus(id: string, status: ThemeFormValues['status']) {
  const res = await api.patch<Envelope<EventThemeRecord>>(`/themes/${id}/status`, { status })
  return res.data.data
}

export async function duplicateTheme(id: string) {
  const res = await api.post<Envelope<EventThemeRecord>>(`/themes/${id}/duplicate`)
  return res.data.data
}

export async function deleteTheme(id: string) {
  await api.delete(`/themes/${id}`)
}

/** Read file → durable data URL + metadata (CDN upload later) */
export async function readAssetFile(file: File): Promise<{
  url: string
  meta: { fileSize: number; width?: number; height?: number; mime: string }
}> {
  // ponytail: data URLs until CDN upload exists; keep under ~4MB so JSON body stays under API limit
  if (file.size > 4 * 1024 * 1024) {
    throw new Error('Image must be 4 MB or smaller')
  }

  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })

  const meta: { fileSize: number; width?: number; height?: number; mime: string } = {
    fileSize: file.size,
    mime: file.type,
  }
  if (file.type.startsWith('image/') && !file.type.includes('svg')) {
    await new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => {
        meta.width = img.naturalWidth
        meta.height = img.naturalHeight
        resolve()
      }
      img.onerror = () => resolve()
      img.src = url
    })
  }
  return { url, meta }
}

export function resolveBackground(theme: Partial<EventThemeRecord> | ThemeFormValues, device: string) {
  const map: Record<string, string | null | undefined> = {
    desktop: theme.desktopBackground,
    laptop: theme.desktopBackground,
    tablet: theme.tabletBackground || theme.desktopBackground,
    mobile: theme.mobileBackground || theme.desktopBackground,
    landscape: theme.landscapeBackground || theme.desktopBackground,
    portrait: theme.portraitBackground || theme.mobileBackground || theme.desktopBackground,
    tv: theme.desktopBackground,
  }
  return map[device] || theme.liveBackground || theme.waitingBackground || theme.previewImage || null
}
