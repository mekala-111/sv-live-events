import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Save,
  Trash2,
  Upload,
  Palette,
} from 'lucide-react'
import {
  ACCEPT_UPLOAD,
  ANIMATION_TYPES,
  ASSET_TYPES,
  BACKGROUND_SLOTS,
  BLEND_MODES,
  COLOR_FIELDS,
  FONT_OPTIONS,
  PREVIEW_DEVICES,
  THEME_CATEGORIES,
  defaultThemeForm,
  slugify,
} from '@/constants/themeBuilder'
import type { EventThemeRecord, PreviewDevice, ThemeFormValues } from '@/types/theme'
import {
  createTheme,
  deleteTheme,
  duplicateTheme,
  getTheme,
  listThemes,
  readAssetFile,
  setThemeStatus,
  updateTheme,
} from '@/services/themeService'
import { ThemePreview } from '@/features/theme-builder/ThemePreview'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

type Tab = 'basics' | 'backgrounds' | 'layers' | 'assets' | 'colors' | 'typography' | 'animation'

const TABS: { id: Tab; label: string }[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'backgrounds', label: 'Backgrounds' },
  { id: 'layers', label: 'Layers' },
  { id: 'assets', label: 'Assets' },
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'animation', label: 'Animation' },
]

function durableUrl(url?: string | null) {
  if (!url || url.startsWith('blob:')) return null
  return url
}

function recordToForm(t: EventThemeRecord): ThemeFormValues {
  const layers =
    t.layers ||
    (typeof t.layersJson === 'string' ? JSON.parse(t.layersJson || '[]') : null) ||
    defaultThemeForm().layers
  const gradientColors = Array.isArray(t.gradientColors)
    ? t.gradientColors
    : typeof t.gradientColors === 'string'
      ? JSON.parse(t.gradientColors || '[]')
      : defaultThemeForm().gradientColors
  const customFonts =
    t.customFonts ||
    (typeof t.customFontsJson === 'string' ? JSON.parse(t.customFontsJson || '[]') : []) ||
    []
  return {
    ...defaultThemeForm(),
    ...t,
    layers,
    gradientColors,
    customFonts,
    previewImage: durableUrl(t.previewImage),
    desktopBackground: durableUrl(t.desktopBackground),
    tabletBackground: durableUrl(t.tabletBackground),
    mobileBackground: durableUrl(t.mobileBackground),
    landscapeBackground: durableUrl(t.landscapeBackground),
    portraitBackground: durableUrl(t.portraitBackground),
    waitingBackground: durableUrl(t.waitingBackground),
    liveBackground: durableUrl(t.liveBackground),
    popupBackground: durableUrl(t.popupBackground),
    loginBackground: durableUrl(t.loginBackground),
    chatBackground: durableUrl(t.chatBackground),
    overlayImage: durableUrl(t.overlayImage),
    frameImage: durableUrl(t.frameImage),
    musicUrl: durableUrl(t.musicUrl),
    logoUrl: durableUrl(t.logoUrl),
    watermarkUrl: durableUrl(t.watermarkUrl),
    assets: (t.assets || []).map((a) => ({ ...a, assetPath: durableUrl(a.assetPath) || '' })),
  }
}

function formatBytes(n?: number) {
  if (!n) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export default function ThemeBuilderPage() {
  const { toast, ToastHost } = useToast()
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('basics')
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState('')

  const listQuery = useQuery({
    queryKey: ['themes', filterCat],
    queryFn: () => listThemes(filterCat ? { category: filterCat } : undefined),
  })

  const detailQuery = useQuery({
    queryKey: ['theme', editingId],
    queryFn: () => getTheme(editingId!),
    enabled: !!editingId,
  })

  const form = useForm<ThemeFormValues>({ defaultValues: defaultThemeForm() })
  const { fields: layerFields, move, update } = useFieldArray({ control: form.control, name: 'layers' })
  const { fields: assetFields, append: appendAsset, remove: removeAsset, update: updateAsset } = useFieldArray({
    control: form.control,
    name: 'assets',
  })

  const watchAll = form.watch()

  useEffect(() => {
    if (detailQuery.data) form.reset(recordToForm(detailQuery.data))
  }, [detailQuery.data, form])

  const saveMutation = useMutation({
    mutationFn: async (as: 'DRAFT' | 'PUBLISHED') => {
      const values = { ...form.getValues(), status: as }
      if (editingId) return updateTheme(editingId, values)
      return createTheme(values)
    },
    onSuccess: (data, as) => {
      setEditingId(data.id)
      qc.invalidateQueries({ queryKey: ['themes'] })
      qc.invalidateQueries({ queryKey: ['theme', data.id] })
      toast(as === 'PUBLISHED' ? 'Theme published' : 'Theme saved')
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast(e.response?.data?.message || 'Save failed', 'error')
    },
  })

  const dupMutation = useMutation({
    mutationFn: duplicateTheme,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['themes'] })
      toast('Theme duplicated')
    },
  })

  const delMutation = useMutation({
    mutationFn: deleteTheme,
    onSuccess: () => {
      setDeleteId(null)
      if (editingId === deleteId) {
        setEditingId(null)
        form.reset(defaultThemeForm())
      }
      qc.invalidateQueries({ queryKey: ['themes'] })
      toast('Theme deleted', 'info')
    },
  })

  const startCreate = () => {
    setEditingId(null)
    form.reset(defaultThemeForm({ name: 'New Theme', slug: `theme-${Date.now().toString(36)}` }))
    setTab('basics')
  }

  const uploadToField = async (field: keyof ThemeFormValues, file: File) => {
    try {
      const { url, meta } = await readAssetFile(file)
      form.setValue(field, url as never, { shouldDirty: true })
      if (field === 'desktopBackground' && !form.getValues('previewImage')) {
        form.setValue('previewImage', url)
      }
      toast(`${field} uploaded · ${formatBytes(meta.fileSize)}${meta.width ? ` · ${meta.width}×${meta.height}` : ''}`)
    } catch (e) {
      toast((e as Error).message || 'Upload failed', 'error')
    }
  }

  const googleFontHref = useMemo(() => {
    const fonts = [...new Set([watchAll.fontHeading, watchAll.fontBody, watchAll.fontButton, watchAll.fontCountdown].filter(Boolean))]
    if (!fonts.length) return null
    const q = fonts.map((f) => `family=${encodeURIComponent(f!).replace(/%20/g, '+')}:wght@400;600;700`).join('&')
    return `https://fonts.googleapis.com/css2?${q}&display=swap`
  }, [watchAll.fontHeading, watchAll.fontBody, watchAll.fontButton, watchAll.fontCountdown])

  if (!editingId && !form.formState.isDirty && listQuery.isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}</div>
      </div>
    )
  }

  const showEditor = editingId !== null || form.formState.isDirty || form.getValues('name') === 'New Theme'

  return (
    <>
      <Helmet>
        <title>Theme Builder | SV Live Events</title>
        {googleFontHref && <link rel="stylesheet" href={googleFontHref} />}
      </Helmet>
      {ToastHost}

      {!showEditor ? (
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Theme Builder</h1>
              <p className="mt-1 text-sm text-white/45">Create unlimited event themes — no code changes required</p>
            </div>
            <Button type="button" onClick={startCreate}>
              <Plus className="h-4 w-4" /> New Theme
            </Button>
          </div>

          <div className="mb-4">
            <Select
              options={[{ value: '', label: 'All categories' }, ...THEME_CATEGORIES.map((c) => ({ value: c, label: c }))]}
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(listQuery.data ?? []).map((t) => (
              <motion.button
                key={t.id}
                type="button"
                whileHover={{ y: -3 }}
                onClick={() => setEditingId(t.id)}
                className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#161616] text-left shadow-[var(--shadow-luxury)]"
              >
                <div
                  className="aspect-video bg-cover bg-center"
                  style={{
                    backgroundImage: t.previewImage || t.desktopBackground
                      ? `url(${t.previewImage || t.desktopBackground})`
                      : `linear-gradient(135deg, ${t.backgroundColor}, ${t.primaryColor})`,
                  }}
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{t.name}</p>
                      <p className="text-xs text-white/40">
                        {t.category} · {t.slug}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                        t.status === 'PUBLISHED' && 'bg-emerald-500/15 text-emerald-300',
                        t.status === 'DRAFT' && 'bg-white/10 text-white/50',
                        t.status === 'ARCHIVED' && 'bg-red-500/15 text-red-300',
                      )}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-1">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-gold"
                      onClick={(e) => {
                        e.stopPropagation()
                        dupMutation.mutate(t.id)
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(t.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col lg:flex-row">
          {/* Editor */}
          <div className="flex-1 overflow-auto border-r border-white/[0.06] lg:max-w-[58%]">
            <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-white/[0.06] bg-[#080808]/90 px-4 py-3 backdrop-blur-xl">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingId(null)
                  form.reset(defaultThemeForm())
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Themes
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-white">{watchAll.name}</p>
                <p className="truncate text-[10px] text-white/40">{watchAll.slug}</p>
              </div>
              <Button type="button" variant="outline" size="sm" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate('DRAFT')}>
                <Save className="h-3.5 w-3.5" /> Draft
              </Button>
              <Button type="button" size="sm" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate('PUBLISHED')}>
                Publish
              </Button>
            </div>

            <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-3 py-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                    tab === t.id ? 'bg-gold/15 text-gold' : 'text-white/45 hover:text-white',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {tab === 'basics' && (
                    <>
                      <Input
                        label="Theme Name"
                        {...form.register('name', {
                          onChange: (e) => {
                            if (!editingId) form.setValue('slug', slugify(e.target.value))
                          },
                        })}
                      />
                      <Input label="Slug" {...form.register('slug')} />
                      <Controller
                        name="category"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            label="Category"
                            options={THEME_CATEGORIES.map((c) => ({ value: c, label: c }))}
                            {...field}
                          />
                        )}
                      />
                      <div>
                        <label className="mb-2 block text-xs font-medium tracking-wide text-white/50 uppercase">Description</label>
                        <textarea
                          rows={3}
                          className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm"
                          {...form.register('description')}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-medium tracking-wide text-white/50 uppercase">Preview Image</label>
                        <UploadRow
                          value={watchAll.previewImage}
                          onUpload={(f) => uploadToField('previewImage', f)}
                          onClear={() => form.setValue('previewImage', null)}
                        />
                      </div>
                      <Controller
                        name="status"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            label="Status"
                            options={[
                              { value: 'DRAFT', label: 'Draft' },
                              { value: 'PUBLISHED', label: 'Published' },
                              { value: 'ARCHIVED', label: 'Archived' },
                            ]}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              if (editingId) setThemeStatus(editingId, e.target.value as ThemeFormValues['status']).then(() => qc.invalidateQueries({ queryKey: ['themes'] }))
                            }}
                          />
                        )}
                      />
                    </>
                  )}

                  {tab === 'backgrounds' &&
                    BACKGROUND_SLOTS.map((slot) => (
                      <div key={slot.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                        <p className="mb-2 text-xs font-medium text-white/60">{slot.label}</p>
                        <UploadRow
                          value={watchAll[slot.id as keyof ThemeFormValues] as string | null}
                          onUpload={(f) => uploadToField(slot.id as keyof ThemeFormValues, f)}
                          onClear={() => form.setValue(slot.id as keyof ThemeFormValues, null as never)}
                          accept={ACCEPT_UPLOAD}
                        />
                      </div>
                    ))}

                  {tab === 'layers' && (
                    <div className="space-y-2">
                      {layerFields.map((layer, i) => (
                        <div key={layer.id} className="rounded-xl border border-white/5 bg-[#121212] p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-white/25" />
                            <p className="flex-1 text-sm font-medium text-white">{layer.name}</p>
                            <button
                              type="button"
                              onClick={() => update(i, { ...layer, visible: !layer.visible })}
                              className="p-1 text-white/40 hover:text-gold"
                            >
                              {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button
                              type="button"
                              disabled={i === 0}
                              onClick={() => move(i, i - 1)}
                              className="text-xs text-white/40 hover:text-white disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={i === layerFields.length - 1}
                              onClick={() => move(i, i + 1)}
                              className="text-xs text-white/40 hover:text-white disabled:opacity-30"
                            >
                              ↓
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <label className="text-[10px] text-white/40">
                              Opacity
                              <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={layer.opacity}
                                onChange={(e) => update(i, { ...layer, opacity: Number(e.target.value) })}
                                className="mt-1 w-full accent-[#F7B733]"
                              />
                            </label>
                            <label className="text-[10px] text-white/40">
                              Blur
                              <input
                                type="range"
                                min={0}
                                max={20}
                                step={1}
                                value={layer.blur}
                                onChange={(e) => update(i, { ...layer, blur: Number(e.target.value) })}
                                className="mt-1 w-full accent-[#F7B733]"
                              />
                            </label>
                            <label className="text-[10px] text-white/40">
                              Scale
                              <input
                                type="range"
                                min={0.5}
                                max={2}
                                step={0.05}
                                value={layer.scale}
                                onChange={(e) => update(i, { ...layer, scale: Number(e.target.value) })}
                                className="mt-1 w-full accent-[#F7B733]"
                              />
                            </label>
                            <label className="text-[10px] text-white/40">
                              Blend
                              <select
                                value={layer.blendMode}
                                onChange={(e) => update(i, { ...layer, blendMode: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs text-white"
                              >
                                {BLEND_MODES.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="text-[10px] text-white/40">
                              X
                              <input
                                type="number"
                                value={layer.x}
                                onChange={(e) => update(i, { ...layer, x: Number(e.target.value) })}
                                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs"
                              />
                            </label>
                            <label className="text-[10px] text-white/40">
                              Y
                              <input
                                type="number"
                                value={layer.y}
                                onChange={(e) => update(i, { ...layer, y: Number(e.target.value) })}
                                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs"
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === 'assets' && (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs text-white/50">Logo</p>
                          <UploadRow value={watchAll.logoUrl} onUpload={(f) => uploadToField('logoUrl', f)} onClear={() => form.setValue('logoUrl', null)} />
                        </div>
                        <div>
                          <p className="mb-2 text-xs text-white/50">Watermark</p>
                          <UploadRow value={watchAll.watermarkUrl} onUpload={(f) => uploadToField('watermarkUrl', f)} onClear={() => form.setValue('watermarkUrl', null)} />
                        </div>
                        <div>
                          <p className="mb-2 text-xs text-white/50">Frame</p>
                          <UploadRow value={watchAll.frameImage} onUpload={(f) => uploadToField('frameImage', f)} onClear={() => form.setValue('frameImage', null)} />
                        </div>
                        <div>
                          <p className="mb-2 text-xs text-white/50">Overlay Image</p>
                          <UploadRow value={watchAll.overlayImage} onUpload={(f) => uploadToField('overlayImage', f)} onClear={() => form.setValue('overlayImage', null)} />
                        </div>
                        <div className="sm:col-span-2">
                          <p className="mb-2 text-xs text-white/50">Background Music (MP3/URL)</p>
                          <Input placeholder="https://…/music.mp3" {...form.register('musicUrl')} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white/60">Decorative assets</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendAsset({
                              assetType: 'floral',
                              assetPath: '',
                              label: 'New asset',
                              opacity: 1,
                              blendMode: 'normal',
                              scale: 1,
                              blur: 0,
                              visible: true,
                              positionX: 5,
                              positionY: 70,
                              sortOrder: assetFields.length,
                            })
                          }
                        >
                          <Plus className="h-3.5 w-3.5" /> Add
                        </Button>
                      </div>
                      {assetFields.map((asset, i) => (
                        <div key={asset.id} className="rounded-xl border border-white/5 p-3">
                          <div className="mb-2 flex gap-2">
                            <select
                              value={asset.assetType}
                              onChange={(e) => updateAsset(i, { ...asset, assetType: e.target.value })}
                              className="rounded-lg border border-white/10 bg-[#121212] px-2 py-1.5 text-xs"
                            >
                              {ASSET_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <button type="button" onClick={() => removeAsset(i)} className="ml-auto text-red-400">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <UploadRow
                            value={asset.assetPath || null}
                            onUpload={async (f) => {
                              try {
                                const { url, meta } = await readAssetFile(f)
                                updateAsset(i, {
                                  ...asset,
                                  assetPath: url,
                                  meta,
                                  metaJson: JSON.stringify(meta),
                                  label: asset.label || f.name,
                                })
                              } catch (e) {
                                toast((e as Error).message || 'Upload failed', 'error')
                              }
                            }}
                            onClear={() => updateAsset(i, { ...asset, assetPath: '' })}
                            meta={asset.meta}
                          />
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <label className="text-[10px] text-white/40">
                              Opacity
                              <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={asset.opacity ?? 1}
                                onChange={(e) => updateAsset(i, { ...asset, opacity: Number(e.target.value) })}
                                className="w-full accent-[#F7B733]"
                              />
                            </label>
                            <label className="text-[10px] text-white/40">
                              X %
                              <input
                                type="number"
                                value={asset.positionX ?? 0}
                                onChange={(e) => updateAsset(i, { ...asset, positionX: Number(e.target.value) })}
                                className="mt-1 w-full rounded border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs"
                              />
                            </label>
                            <label className="text-[10px] text-white/40">
                              Y %
                              <input
                                type="number"
                                value={asset.positionY ?? 0}
                                onChange={(e) => updateAsset(i, { ...asset, positionY: Number(e.target.value) })}
                                className="mt-1 w-full rounded border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs"
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {tab === 'colors' && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {COLOR_FIELDS.map((c) => (
                        <label key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                          <span className="mb-2 flex items-center gap-1 text-[10px] tracking-wide text-white/45 uppercase">
                            <Palette className="h-3 w-3" /> {c.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={normalizeHex(String(watchAll[c.id as keyof ThemeFormValues] || '#000000'))}
                              onChange={(e) => form.setValue(c.id as keyof ThemeFormValues, e.target.value as never)}
                              className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
                            />
                            <input
                              {...form.register(c.id as keyof ThemeFormValues)}
                              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#121212] px-2 py-1.5 font-mono text-xs"
                              placeholder="#HEX / rgba()"
                            />
                          </div>
                        </label>
                      ))}
                      <div className="col-span-full">
                        <p className="mb-2 text-xs text-white/50">Gradient stops (comma-separated HEX)</p>
                        <input
                          className="w-full rounded-xl border border-white/10 bg-[#121212] px-3 py-2 text-sm font-mono"
                          value={(watchAll.gradientColors || []).join(', ')}
                          onChange={(e) =>
                            form.setValue(
                              'gradientColors',
                              e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                            )
                          }
                        />
                      </div>
                    </div>
                  )}

                  {tab === 'typography' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(
                        [
                          ['fontHeading', 'Heading Font'],
                          ['fontBody', 'Body Font'],
                          ['fontButton', 'Button Font'],
                          ['fontCountdown', 'Countdown Font'],
                        ] as const
                      ).map(([key, label]) => (
                        <Controller
                          key={key}
                          name={key}
                          control={form.control}
                          render={({ field }) => (
                            <Select
                              label={label}
                              options={FONT_OPTIONS.map((f) => ({ value: f, label: f }))}
                              value={field.value || ''}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      ))}
                      <p className="col-span-full text-xs text-white/40">
                        Google Fonts load automatically in preview. Custom / Adobe font URLs can be added via Custom Fonts JSON when CDN is wired.
                      </p>
                    </div>
                  )}

                  {tab === 'animation' && (
                    <>
                      <Controller
                        name="animationType"
                        control={form.control}
                        render={({ field }) => <Select label="Animation" options={ANIMATION_TYPES} {...field} />}
                      />
                      {(
                        [
                          ['animationSpeed', 'Speed', 0.25, 3],
                          ['animationDensity', 'Density', 0.25, 3],
                          ['animationOpacity', 'Opacity', 0, 1],
                        ] as const
                      ).map(([key, label, min, max]) => (
                        <label key={key} className="block text-xs text-white/50">
                          {label}: {Number(watchAll[key]).toFixed(2)}
                          <input
                            type="range"
                            min={min}
                            max={max}
                            step={0.05}
                            value={Number(watchAll[key])}
                            onChange={(e) => form.setValue(key, Number(e.target.value))}
                            className="mt-2 w-full accent-[#F7B733]"
                          />
                        </label>
                      ))}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Live preview */}
          <aside className="sticky top-0 flex h-auto flex-col gap-4 overflow-auto bg-[#0a0a0a] p-4 lg:h-screen lg:w-[42%] lg:min-w-[360px]">
            <div className="flex flex-wrap gap-1">
              {PREVIEW_DEVICES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d.id)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide transition',
                    device === d.id ? 'bg-gold/15 text-gold' : 'text-white/40 hover:text-white',
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <ThemePreview theme={watchAll} device={device} />
            <div className="rounded-xl border border-white/5 bg-[#161616] p-3 text-xs text-white/45">
              <p className="font-medium text-white/70">Live sync</p>
              <p className="mt-1">Backgrounds, colors, fonts, layers, animations, and assets update instantly.</p>
            </div>
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete theme?"
        message="This permanently removes the theme and its assets from the database."
        confirmLabel="Delete"
        danger
        loading={delMutation.isPending}
        onConfirm={() => deleteId && delMutation.mutate(deleteId)}
      />
    </>
  )
}

function normalizeHex(v: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v
  if (/^#[0-9a-fA-F]{3}$/.test(v)) return v
  return '#F7B733'
}

function UploadRow({
  value,
  onUpload,
  onClear,
  accept = 'image/*,video/*,.json',
  meta,
}: {
  value?: string | null
  onUpload: (f: File) => void
  onClear: () => void
  accept?: string
  meta?: { fileSize?: number; width?: number; height?: number; mime?: string }
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/10 bg-[#0a0a0a]">
        {value ? (
          value.startsWith('data:video/') || value.match(/\.(mp4|webm)$/i) || (value.startsWith('blob:') && meta?.mime?.startsWith('video')) ? (
            <video src={value} className="h-full w-full object-cover" muted />
          ) : (
            <img
              src={value.startsWith('blob:') ? '' : value}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          )
        ) : (
          <Upload className="h-4 w-4 text-white/25" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {meta && (
          <p className="mb-1 text-[10px] text-white/35">
            {formatBytes(meta.fileSize)}
            {meta.width ? ` · ${meta.width}×${meta.height}` : ''}
            {/* ponytail: crop/compress UI — native file replace covers replace; add canvas crop when needed */}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/70 hover:border-gold/40 hover:text-gold">
            {value ? 'Replace' : 'Upload'}
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onUpload(f)
              }}
            />
          </label>
          {value && (
            <button type="button" onClick={onClear} className="rounded-lg border border-red-500/20 px-2.5 py-1 text-[11px] text-red-300">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
