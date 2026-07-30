import { useMemo, useState } from 'react'
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
  type FieldPath,
} from 'react-hook-form'
import {
  Check,
  Copy,
  Download,
  Eye,
  Plus,
  Share2,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  CATEGORIES,
  DETAIL_FIELDS,
  EVENT_THEMES,
  LATENCY_OPTIONS,
  LIVE_FEATURES,
  LANGUAGES,
  PRIVACY_OPTIONS,
  SOCIAL_PLATFORMS,
  STATUSES,
  STREAM_TYPES,
  SUB_CATEGORIES,
  TIMEZONES,
  UPLOAD_SLOTS,
  VIDEO_QUALITIES,
} from '@/constants/eventPortal'
import type { EventAnalytics, EventFormValues } from '@/types/event'
import { SectionCard } from '@/components/ui/SectionCard'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { UploadSlot } from '@/features/uploads/UploadSlot'
import { ThemeGallery } from '@/features/theme/ThemeGallery'
import { usePublishedThemes } from '@/features/theme/DynamicThemeShell'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

function FieldError({ name }: { name: FieldPath<EventFormValues> }) {
  const {
    formState: { errors },
  } = useFormContext<EventFormValues>()
  const err = name.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], errors)
  const message = (err as { message?: string } | undefined)?.message
  return message ? <p className="mt-1 text-xs text-red-400">{message}</p> : null
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-xs font-medium tracking-wide text-white/50 uppercase">{children}</label>
}

function TextArea({
  name,
  label,
  rows = 3,
  placeholder,
}: {
  name: FieldPath<EventFormValues>
  label: string
  rows?: number
  placeholder?: string
}) {
  const { register } = useFormContext<EventFormValues>()
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
        {...register(name)}
      />
      <FieldError name={name} />
    </div>
  )
}

export function BasicInfoSection({ onSave, saving }: { onSave: () => void; saving?: boolean }) {
  const { register, control, setValue, watch } = useFormContext<EventFormValues>()
  const category = watch('category')
  const slug = watch('slug')
  const subOptions = useMemo(
    () => SUB_CATEGORIES[category] ?? SUB_CATEGORIES.default,
    [category],
  )

  return (
    <SectionCard
      title="Event Basic Information"
      description="Core identity, schedule, and publishing defaults"
      action={
        <Button type="button" size="sm" variant="gold" onClick={onSave} disabled={saving}>
          Save
        </Button>
      }
      delay={0.05}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Input id="name" label="Event Name" {...register('name')} />
          <FieldError name="name" />
        </div>
        <div>
          <Label>Slug</Label>
          <div className="relative">
            <input
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 pr-10 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
              {...register('slug')}
            />
            {slug.length >= 3 && (
              <Check className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-emerald-400" />
            )}
          </div>
          <FieldError name="slug" />
        </div>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              label="Category"
              options={CATEGORIES}
              value={field.value}
              onChange={(e) => {
                field.onChange(e.target.value)
                const next = SUB_CATEGORIES[e.target.value] ?? SUB_CATEGORIES.default
                setValue('subCategory', next[0]?.value ?? 'general')
              }}
            />
          )}
        />
        <Controller
          name="subCategory"
          control={control}
          render={({ field }) => <Select label="Sub Category" options={subOptions} {...field} />}
        />
        <Controller
          name="themeId"
          control={control}
          render={({ field }) => (
            <Select
              label="Theme Selection"
              options={EVENT_THEMES.map((t) => ({ value: t.id, label: t.name }))}
              {...field}
            />
          )}
        />
        <Controller
          name="language"
          control={control}
          render={({ field }) => <Select label="Language" options={LANGUAGES} {...field} />}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <div>
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => field.onChange(s.value)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                      field.value === s.value
                        ? s.value === 'published'
                          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                          : 'border-gold/40 bg-gold/15 text-gold'
                        : 'border-white/10 text-white/50 hover:border-white/20',
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        />
        <Controller
          name="privacy"
          control={control}
          render={({ field }) => <Select label="Privacy" options={PRIVACY_OPTIONS} {...field} />}
        />
        <div className="flex items-center sm:col-span-2">
          <Controller
            name="bookingEnabled"
            control={control}
            render={({ field }) => (
              <Toggle checked={field.value} onChange={field.onChange} label="Booking Enabled" id="booking" />
            )}
          />
        </div>
        <div>
          <Input id="startDate" type="datetime-local" label="Start Date" {...register('startDate')} />
          <FieldError name="startDate" />
        </div>
        <div>
          <Input id="endDate" type="datetime-local" label="End Date" {...register('endDate')} />
          <FieldError name="endDate" />
        </div>
        <Input id="countdown" label="Countdown Title" {...register('countdownTitle')} />
        <Controller
          name="timezone"
          control={control}
          render={({ field }) => <Select label="Timezone" options={TIMEZONES} {...field} />}
        />
      </div>
    </SectionCard>
  )
}

export function StreamingSection({ onCopy }: { onCopy: (text: string, label: string) => void }) {
  const { register, control, watch } = useFormContext<EventFormValues>()
  const [showKey, setShowKey] = useState(false)
  const streamKey = watch('streamKey')

  return (
    <SectionCard title="Streaming Information" description="Ingest endpoints, quality, and recording" delay={0.08}>
      <div className="space-y-4">
        <div>
          <Label>Stream Type</Label>
          <Controller
            name="streamType"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {STREAM_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => field.onChange(t.value)}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm font-medium transition',
                      field.value === t.value
                        ? 'border-gold bg-gold/15 text-gold shadow-[var(--glow-gold)]'
                        : 'border-white/10 text-white/50 hover:border-white/20',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>
        <div>
          <Label>Visibility</Label>
          <Controller
            name="streamVisibility"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {PRIVACY_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => field.onChange(t.value)}
                    className={cn(
                      'rounded-xl border px-3 py-1.5 text-xs font-medium capitalize transition',
                      field.value === t.value
                        ? 'border-gold/50 bg-gold/10 text-gold'
                        : 'border-white/10 text-white/45',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>
        <Input id="rtmp" label="RTMP URL" {...register('rtmpUrl')} />
        <div>
          <Label>Stream Key</Label>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
              {...register('streamKey')}
            />
            <Button type="button" variant="outline" size="icon" onClick={() => setShowKey((s) => !s)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onCopy(streamKey, 'Stream key')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Input id="backup" label="Backup Stream URL" {...register('backupStreamUrl')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="videoQuality"
            control={control}
            render={({ field }) => <Select label="Video Quality" options={VIDEO_QUALITIES} {...field} />}
          />
          <Controller
            name="latency"
            control={control}
            render={({ field }) => <Select label="Latency" options={LATENCY_OPTIONS} {...field} />}
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <Controller
            name="enableDvr"
            control={control}
            render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Enable DVR" />}
          />
          <Controller
            name="autoRecording"
            control={control}
            render={({ field }) => (
              <Toggle checked={field.value} onChange={field.onChange} label="Auto Recording" />
            )}
          />
        </div>
        <Input id="viewerLimit" type="number" label="Viewer Limit" {...register('viewerLimit')} />
      </div>
    </SectionCard>
  )
}

export function BrandingSection() {
  const { control } = useFormContext<EventFormValues>()
  return (
    <SectionCard title="Branding & Assets" description="Drag & drop or click to upload" delay={0.1}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {UPLOAD_SLOTS.map((slot) => (
          <Controller
            key={slot.id}
            name={`assets.${slot.id}` as FieldPath<EventFormValues>}
            control={control}
            render={({ field }) => (
              <UploadSlot
                label={slot.label}
                hint={slot.hint}
                value={field.value as string | null}
                onChange={(url) => field.onChange(url)}
              />
            )}
          />
        ))}
      </div>
    </SectionCard>
  )
}

export function ThemeSection() {
  const { control, setValue } = useFormContext<EventFormValues>()
  const themeId = useWatch({ control, name: 'themeId' })
  const { data: dbThemes } = usePublishedThemes()

  const gallery = useMemo(() => {
    if (dbThemes?.length) {
      return dbThemes.map((t) => ({
        id: t.slug,
        name: t.name,
        gradient:
          Array.isArray(t.gradientColors) && t.gradientColors.length >= 2
            ? `linear-gradient(135deg, ${t.gradientColors[0]}, ${t.gradientColors[1]})`
            : `linear-gradient(135deg, ${t.backgroundColor}, ${t.primaryColor})`,
        preview: t.previewImage || t.desktopBackground || undefined,
      }))
    }
    return EVENT_THEMES
  }, [dbThemes])

  const theme = gallery.find((t) => t.id === themeId) ?? gallery[0]

  return (
    <SectionCard
      title="Theme Customizer"
      description="Themes from Theme Builder — live preview updates on select"
      action={
        <a href="/admin/themes" className="text-xs text-gold/80 hover:text-gold">
          Open Theme Builder
        </a>
      }
      delay={0.12}
      className="lg:col-span-2"
    >
      <div
        className="mb-4 h-24 overflow-hidden rounded-xl border border-white/10 bg-cover bg-center"
        style={{
          background: theme?.preview ? undefined : theme?.gradient,
          backgroundImage: theme?.preview ? `url(${theme.preview})` : undefined,
        }}
      >
        <div className="flex h-full items-end bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="font-display text-lg font-semibold text-white">{theme?.name} preview</p>
        </div>
      </div>
      <Controller
        name="themeId"
        control={control}
        render={({ field }) => (
          <ThemeGallery
            themes={gallery}
            selectedId={field.value}
            onSelect={(id) => {
              field.onChange(id)
              setValue('themeId', id)
            }}
          />
        )}
      />
    </SectionCard>
  )
}

export function DetailsSection() {
  const { register } = useFormContext<EventFormValues>()
  return (
    <SectionCard title="Event Details" delay={0.14}>
      <div className="space-y-4">
        {DETAIL_FIELDS.map((f) =>
          f.type === 'textarea' ? (
            <TextArea key={f.id} name={f.id as FieldPath<EventFormValues>} label={f.label} rows={f.rows} />
          ) : (
            <Input key={f.id} id={f.id} label={f.label} {...register(f.id as FieldPath<EventFormValues>)} />
          ),
        )}
      </div>
    </SectionCard>
  )
}

export function SocialSection() {
  const { register } = useFormContext<EventFormValues>()
  return (
    <SectionCard title="Social Links" delay={0.15}>
      <div className="space-y-3">
        {SOCIAL_PLATFORMS.map((s) => (
          <div key={s.id}>
            <Label>{s.label}</Label>
            <input
              placeholder={s.placeholder}
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
              {...register(`socials.${s.id}` as FieldPath<EventFormValues>)}
            />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export function LiveFeaturesSection() {
  const { control } = useFormContext<EventFormValues>()
  return (
    <SectionCard title="Live Streaming Features" delay={0.16}>
      <div className="space-y-3">
        {LIVE_FEATURES.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
          >
            <span className="text-sm text-white/75">{f.label}</span>
            <Controller
              name={`features.${f.id}` as FieldPath<EventFormValues>}
              control={control}
              render={({ field }) => (
                <Toggle checked={Boolean(field.value)} onChange={field.onChange} id={`feat-${f.id}`} />
              )}
            />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export function GuestAccessSection({ onCopy }: { onCopy: (text: string, label: string) => void }) {
  const { register, watch } = useFormContext<EventFormValues>()
  const link = watch('invitationLink')

  return (
    <SectionCard title="Guest Access" delay={0.17}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Guest Password</Label>
            <div className="flex gap-2">
              <input
                className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm"
                {...register('guestPassword')}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => onCopy(watch('guestPassword'), 'Guest password')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>VIP Password</Label>
            <div className="flex gap-2">
              <input
                className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm"
                {...register('vipPassword')}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => onCopy(watch('vipPassword'), 'VIP password')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="rounded-xl border border-white/10 bg-white p-3">
            <QRCodeSVG value={link || 'https://svliveevents.com'} size={96} />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Invitation Link</Label>
            <div className="flex gap-2">
              <input
                className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm"
                {...register('invitationLink')}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => onCopy(link, 'Invitation link')}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (navigator.share) navigator.share({ url: link, title: 'Event invitation' }).catch(() => {})
                  else onCopy(link, 'Invitation link')
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <Button type="button" variant="ghost" size="sm" className="text-gold">
              <Download className="h-3.5 w-3.5" /> Download QR
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

export function RegistrationSection() {
  const { control } = useFormContext<EventFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'registrationFields' })
  const [preview, setPreview] = useState(false)

  return (
    <SectionCard
      title="Registration"
      action={
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setPreview((p) => !p)}>
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ id: crypto.randomUUID(), label: 'New Field', type: 'text', required: false })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Field
          </Button>
        </div>
      }
      delay={0.18}
    >
      <Controller
        name="registrationRequired"
        control={control}
        render={({ field }) => (
          <div className="mb-4">
            <Toggle
              checked={field.value}
              onChange={field.onChange}
              label="Registration Required"
              id="reg-required"
            />
          </div>
        )}
      />
      <p className="mb-3 text-sm text-emerald-400/90">
        <TrendingUp className="mr-1 inline h-3.5 w-3.5" /> 156 Responses
      </p>
      <div className="space-y-2">
        {fields.map((f, i) => (
          <div key={f.id} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <Controller
              name={`registrationFields.${i}.label`}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-sm"
                />
              )}
            />
            <Controller
              name={`registrationFields.${i}.required`}
              control={control}
              render={({ field }) => (
                <Toggle checked={field.value} onChange={field.onChange} label="Req" id={`req-${f.id}`} />
              )}
            />
            <button type="button" onClick={() => remove(i)} className="p-2 text-white/40 hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {preview && (
        <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gold uppercase">Form preview</p>
          {fields.map((f) => (
            <div key={f.id} className="mb-2">
              <p className="mb-1 text-xs text-white/50">
                {f.label}
                {f.required && ' *'}
              </p>
              <div className="h-9 rounded-lg border border-white/10 bg-[#121212]" />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

export function SeoSection() {
  const { register, control, watch, setValue } = useFormContext<EventFormValues>()
  const keywords = watch('keywords')
  const [kw, setKw] = useState('')

  return (
    <SectionCard title="SEO Settings" delay={0.19}>
      <div className="space-y-4">
        <Input id="seoTitle" label="SEO Title" {...register('seoTitle')} />
        <TextArea name="metaDescription" label="Meta Description" rows={3} />
        <div>
          <Label>Keywords</Label>
          <div className="mb-2 flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs text-gold"
              >
                {k}
                <button
                  type="button"
                  onClick={() => setValue('keywords', keywords.filter((x) => x !== k))}
                  className="text-gold/60 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && kw.trim()) {
                e.preventDefault()
                if (!keywords.includes(kw.trim())) setValue('keywords', [...keywords, kw.trim()])
                setKw('')
              }
            }}
            placeholder="Type and press Enter"
            className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm"
          />
        </div>
        <Input id="ogTitle" label="Open Graph Title" {...register('ogTitle')} />
        <TextArea name="ogDescription" label="Open Graph Description" rows={2} />
        <Controller
          name="twitterCard"
          control={control}
          render={({ field }) => (
            <Select
              label="Twitter Card"
              options={[
                { value: 'summary', label: 'Summary' },
                { value: 'summary_large_image', label: 'Summary Large Image' },
              ]}
              {...field}
            />
          )}
        />
        <Input id="canonical" label="Canonical URL" {...register('canonicalUrl')} />
      </div>
    </SectionCard>
  )
}

export function AnalyticsSection({ data }: { data?: EventAnalytics }) {
  if (!data) return null
  const metrics = [
    { label: 'Expected Viewers', value: data.expectedViewers.toLocaleString() },
    {
      label: 'Current Viewers',
      value: data.currentViewers.toLocaleString(),
      delta: `+${data.currentViewersDelta}%`,
    },
    { label: 'Revenue', value: formatCurrency(data.revenue) },
    { label: 'Packages Sold', value: String(data.packagesSold) },
  ]

  return (
    <SectionCard title="Analytics" description="Live preview metrics" delay={0.2}>
      <div className="mb-5 grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[10px] tracking-wide text-white/40 uppercase">{m.label}</p>
            <p className="mt-1 font-display text-lg font-semibold text-white">{m.value}</p>
            {'delta' in m && m.delta && (
              <p className="text-xs text-emerald-400">{m.delta}</p>
            )}
          </div>
        ))}
      </div>
      <p className="mb-2 text-xs tracking-wide text-white/40 uppercase">Traffic Sources</p>
      <div className="flex items-center gap-4">
        <div className="h-36 w-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.trafficSources} dataKey="value" nameKey="name" innerRadius={36} outerRadius={58} paddingAngle={3}>
                {data.trafficSources.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-sm">
          {data.trafficSources.map((s) => (
            <li key={s.name} className="flex items-center gap-2 text-white/70">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              {s.name}
              <span className="text-white/40">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  )
}

export function PublishSection({
  onPreview,
  onDraft,
  onPublish,
  onDuplicate,
  onDelete,
}: {
  onPreview: () => void
  onDraft: () => void
  onPublish: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const actions = [
    { label: 'Preview Event', onClick: onPreview },
    { label: 'Save Draft', onClick: onDraft },
    { label: 'Publish Event', onClick: onPublish, gold: true },
    { label: 'Duplicate Event', onClick: onDuplicate },
    { label: 'Delete Event', onClick: onDelete, danger: true },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
      <SectionCard title="Publish" delay={0.21}>
        <ul className="space-y-1">
          {actions.map((a) => (
            <li key={a.label}>
              <button
                type="button"
                onClick={a.onClick}
                className={cn(
                  'flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.04]',
                  a.danger && 'text-red-400 hover:bg-red-500/10',
                  a.gold && 'text-gold',
                  !a.danger && !a.gold && 'text-white/70',
                )}
              >
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      </SectionCard>
      <PromoCard onPublish={onPublish} />
    </div>
  )
}

function PromoCard({ onPublish }: { onPublish: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-[#2a1f0a] via-[#1a1408] to-[#161616] p-6 shadow-[var(--glow-gold)]">
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
      <p className="font-display text-lg font-semibold text-white">Make your event unforgettable</p>
      <p className="mt-2 text-sm text-white/55">
        Publish your event and reach thousands of people worldwide.
      </p>
      <Button type="button" variant="gold" className="mt-5 shadow-[var(--glow-gold)]" onClick={onPublish}>
        Publish Event Now
      </Button>
    </div>
  )
}
