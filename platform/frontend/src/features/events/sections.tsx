import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Controller, useFormContext, useWatch, type FieldPath } from 'react-hook-form'
import { Check, Copy, Eye, ImagePlus, Pencil, Trash2 } from 'lucide-react'
import {
  CATEGORIES,
  FONT_STYLES,
  SERVICE_OPTIONS,
  WEBSITE_DESIGNS,
  YOUTUBE_CHANNELS,
} from '@/constants/eventPortal'
import type { EventFormValues } from '@/types/event'
import type { EventThemeRecord } from '@/types/theme'
import { SectionCard } from '@/components/ui/SectionCard'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { usePublishedThemes } from '@/features/theme/DynamicThemeShell'

const MAX_EVENT_IMAGES = 10
const EVENT_IMAGE_MAX = 4 * 1024 * 1024
const SMALL_IMAGE_MAX = 500 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png']

type ThemeDesignOption = {
  id: string
  name: string
  category: string
  preview?: string
  gradient: string
}

function themeToDesign(theme: EventThemeRecord): ThemeDesignOption {
  const gradientColors = Array.isArray(theme.gradientColors) ? theme.gradientColors : []
  const from = gradientColors[0] || theme.backgroundColor || '#121212'
  const to = gradientColors[1] || theme.primaryColor || '#F7B733'
  return {
    id: theme.slug || theme.id,
    name: theme.name,
    category: theme.category,
    preview: theme.previewImage || theme.desktopBackground || undefined,
    gradient: `linear-gradient(135deg, ${from}, ${to})`,
  }
}

function useThemeBuilderDesigns() {
  const query = usePublishedThemes()
  const fallback: ThemeDesignOption[] = WEBSITE_DESIGNS.map((d) => ({ ...d, category: 'Fallback' }))
  const designs = query.data?.length ? query.data.map(themeToDesign) : fallback
  return {
    ...query,
    designs,
    fromThemeBuilder: Boolean(query.data?.length),
  }
}

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
  maxLength,
}: {
  name: FieldPath<EventFormValues>
  label: string
  rows?: number
  placeholder?: string
  maxLength?: number
}) {
  const { register } = useFormContext<EventFormValues>()
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
        {...register(name)}
      />
      <FieldError name={name} />
    </div>
  )
}

function validateImage(file: File, maxSize: number) {
  if (!IMAGE_TYPES.includes(file.type)) return 'Only JPG, JPEG, and PNG files are allowed.'
  if (file.size > maxSize) return `File must be ${maxSize === EVENT_IMAGE_MAX ? '4 MB' : '500 KB'} or smaller.`
  return null
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}

function SingleImageUpload({
  label,
  hint,
  value,
  onChange,
  maxSize = SMALL_IMAGE_MAX,
}: {
  label: string
  hint: string
  value: string | null
  onChange: (url: string | null) => void
  maxSize?: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const accept = async (file?: File | null) => {
    if (!file) return
    const message = validateImage(file, maxSize)
    if (message) {
      setError(message)
      return
    }
    try {
      setError('')
      onChange(await fileToDataUrl(file))
    } catch {
      setError('Could not read image')
    }
  }

  return (
    <div>
      <div
        className={cn(
          'group relative aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-white/10 bg-[#121212] transition',
          dragging && 'border-gold/60 bg-gold/5',
          value && 'border-solid',
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault()
          setDragging(false)
          accept(e.dataTransfer.files?.[0])
        }}
      >
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center"
          >
            <ImagePlus className="h-6 w-6 text-gold/70" />
            <span className="text-xs font-medium text-white/70">{label}</span>
            <span className="text-[10px] text-white/35">{hint}</span>
          </button>
        )}
        {value && (
          <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
            <span className="truncate text-[11px] font-medium text-white">{label}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-white/10 p-1.5 text-white hover:text-gold">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onChange(null)} className="rounded-lg bg-white/10 p-1.5 text-white hover:text-red-300">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={(e) => accept(e.target.files?.[0])} />
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  )
}

function EventImagesUpload() {
  const { control, setValue } = useFormContext<EventFormValues>()
  const inputRef = useRef<HTMLInputElement>(null)
  const images = useWatch({ control, name: 'eventImages' }) ?? []
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const addFiles = async (files: FileList | File[]) => {
    const next = [...images]
    for (const file of Array.from(files)) {
      if (next.length >= MAX_EVENT_IMAGES) {
        setError('Maximum 10 images are allowed.')
        break
      }
      const message = validateImage(file, EVENT_IMAGE_MAX)
      if (message) {
        setError(message)
        continue
      }
      try {
        next.push(await fileToDataUrl(file))
      } catch {
        setError('Could not read image')
      }
    }
    setValue('eventImages', next, { shouldDirty: true, shouldValidate: true })
    if (next.length <= MAX_EVENT_IMAGES) setError('')
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'rounded-xl border border-dashed border-white/10 bg-[#121212] p-5 text-center transition',
          dragging && 'border-gold/60 bg-gold/5',
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
      >
        <button type="button" onClick={() => inputRef.current?.click()} className="mx-auto flex flex-col items-center gap-2">
          <ImagePlus className="h-7 w-7 text-gold/75" />
          <span className="text-sm font-medium text-white">Event Images</span>
          <span className="text-xs text-white/40">Up to 10 JPG/PNG images, 4 MB each</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => e.target.files && addFiles(e.target.files)}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#121212]">
              <img src={src} alt={`Event image ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setValue('eventImages', images.filter((_, i) => i !== index), { shouldDirty: true, shouldValidate: true })}
                className="absolute top-2 right-2 rounded-lg bg-black/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function EventInformationSection() {
  const { register, control, setValue, watch } = useFormContext<EventFormValues>()
  const slug = watch('slug')
  const { designs, isLoading } = useThemeBuilderDesigns()

  return (
    <SectionCard title="Event Information" description="Original portal fields, modernized" delay={0.05}>
      <div className="grid gap-4 md:grid-cols-2">
        <Controller name="serviceType" control={control} render={({ field }) => <Select label="Selected Service" options={SERVICE_OPTIONS} {...field} />} />
        <Input id="eventDate" type="date" label="Event Date" {...register('eventDate')} />
        <Controller name="category" control={control} render={({ field }) => <Select label="Event Type" options={CATEGORIES} {...field} />} />
        <Controller
          name="themeId"
          control={control}
          render={({ field }) => (
            <Select
              label="Design"
              options={designs.map((d) => ({ value: d.id, label: isLoading ? 'Loading themes…' : d.name }))}
              {...field}
              onChange={(e) => {
                field.onChange(e)
                setValue('websiteDesignId', e.target.value, { shouldDirty: true, shouldValidate: true })
              }}
            />
          )}
        />
        <div>
          <Input id="name" label="Page Title" placeholder="Ravi weds Rani" maxLength={80} {...register('name')} />
          <FieldError name="name" />
        </div>
        <div>
          <Label>Domain Name / Slug</Label>
          <div className="relative">
            <input
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 pr-10 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
              placeholder="raviwedsrani"
              {...register('slug', { onChange: (e) => { e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') } })}
            />
            {slug?.length >= 3 && <Check className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-emerald-400" />}
          </div>
          <p className="mt-1 text-xs text-white/35">Preview URL: /live/{slug || 'yourdomain'}</p>
          <FieldError name="slug" />
        </div>
        <div className="md:col-span-2">
          <Input id="liveTimings" label="Live Event Timings" placeholder="Live Starts on 30 Jul, 2026 from 6:00 PM IST Onwards" maxLength={160} {...register('liveTimings')} />
          <FieldError name="liveTimings" />
        </div>
        <Controller name="rememberChoice" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Remember My Choice" />} />
      </div>
    </SectionCard>
  )
}

export function YouTubeStreamingSection({ onCopy }: { onCopy: (text: string, label: string) => void }) {
  const { register, control, watch } = useFormContext<EventFormValues>()
  const [showKey, setShowKey] = useState(false)
  const key = watch('youtubeLiveKey')
  return (
    <SectionCard title="YouTube Streaming" description="Only original YouTube event controls" delay={0.08}>
      <div className="grid gap-4 md:grid-cols-2">
        <Controller name="youtubeChannel" control={control} render={({ field }) => <Select label="YouTube Channel" options={YOUTUBE_CHANNELS} {...field} />} />
        <div className="md:col-span-2">
          <Input id="youtubeLiveUrl" label="YouTube Live URL" placeholder="https://youtube.com/live/..." {...register('youtubeLiveUrl')} />
          <FieldError name="youtubeLiveUrl" />
        </div>
        <div className="md:col-span-2">
          <Label>YouTube Live Key</Label>
          <div className="flex gap-2">
            <input type={showKey ? 'text' : 'password'} className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20" {...register('youtubeLiveKey')} />
            <Button type="button" variant="outline" size="icon" onClick={() => setShowKey((s) => !s)}><Eye className="h-4 w-4" /></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => onCopy(key, 'YouTube live key')}><Copy className="h-4 w-4" /></Button>
          </div>
          <FieldError name="youtubeLiveKey" />
        </div>
        <div className="md:col-span-2">
          <Input id="teaserUrl" label="Teaser URL" placeholder="https://youtu.be/..." {...register('teaserUrl')} />
          <FieldError name="teaserUrl" />
        </div>
        <Controller name="watchLiveButton" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Add Watch Live Button" />} />
      </div>
    </SectionCard>
  )
}

export function EventContentSection() {
  const { register, control } = useFormContext<EventFormValues>()
  return (
    <SectionCard title="Event Content" delay={0.1}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input id="scrollMessage" label="Scroll Message" maxLength={140} placeholder="Welcome to the live event" {...register('scrollMessage')} />
          <FieldError name="scrollMessage" />
        </div>
        <TextArea name="remarks1" label="Remarks 1" rows={3} maxLength={500} />
        <TextArea name="remarks2" label="Remarks 2" rows={3} maxLength={500} />
        <div>
          <Input id="whatsappNumber" label="WhatsApp Support Number" placeholder="+919999999999" {...register('whatsappNumber')} />
          <FieldError name="whatsappNumber" />
        </div>
        <div className="flex flex-col gap-4 pt-2">
          <Controller name="socialShare" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Add Social Media Share Button" />} />
          <Controller name="bookingEnabled" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Enable Payment / Pay Option" />} />
        </div>
      </div>
    </SectionCard>
  )
}

export function EventMediaSection() {
  const { control } = useFormContext<EventFormValues>()
  return (
    <SectionCard title="Media Uploads" description="Validated previews for original portal assets" delay={0.12}>
      <div className="space-y-5">
        <EventImagesUpload />
        <div className="grid gap-3 md:grid-cols-3">
          <Controller name="logo" control={control} render={({ field }) => <SingleImageUpload label="Logo" hint="Max 500 KB" value={field.value} onChange={field.onChange} />} />
          <Controller name="customImage" control={control} render={({ field }) => <SingleImageUpload label="Custom Image" hint="800px height, max 500 KB" value={field.value} onChange={field.onChange} />} />
          <Controller name="whatsappImage" control={control} render={({ field }) => <SingleImageUpload label="WhatsApp Image" hint="500 x 500+, max 500 KB" value={field.value} onChange={field.onChange} />} />
        </div>
      </div>
    </SectionCard>
  )
}

export function AppearanceSection({ onPreview }: { onPreview: () => void }) {
  const { register, control, setValue, watch } = useFormContext<EventFormValues>()
  const selected = watch('websiteDesignId')
  const fontColor = watch('fontColor')
  const { designs, fromThemeBuilder, isLoading, isError } = useThemeBuilderDesigns()
  return (
    <SectionCard title="Appearance" action={<Button type="button" variant="outline" size="sm" onClick={onPreview}><Eye className="h-3.5 w-3.5" /> Preview</Button>} delay={0.14}>
      <div className="grid gap-4 md:grid-cols-2">
        <Controller name="fontStyle" control={control} render={({ field }) => <Select label="Font Style" options={FONT_STYLES} {...field} />} />
        <div>
          <Label>Font Color</Label>
          <div className="flex gap-2">
            <input type="color" value={fontColor} onChange={(e) => setValue('fontColor', e.target.value, { shouldDirty: true, shouldValidate: true })} className="h-12 w-14 rounded-xl border border-white/10 bg-[#121212] p-1" />
            <input className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white" {...register('fontColor')} />
          </div>
          <FieldError name="fontColor" />
        </div>
      </div>
      <div className="mt-5">
        <Label>Website Design</Label>
        <p className="mb-3 text-xs text-white/35">
          {isLoading
            ? 'Loading designs from Theme Builder…'
            : fromThemeBuilder
              ? 'Showing published designs from Theme Builder.'
              : isError
                ? 'Could not load Theme Builder designs. Showing fallback designs.'
                : 'No published Theme Builder designs yet. Showing fallback designs.'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {designs.map((design) => (
            <button
              key={design.id}
              type="button"
              onClick={() => {
                setValue('websiteDesignId', design.id, { shouldDirty: true, shouldValidate: true })
                setValue('themeId', design.id, { shouldDirty: true, shouldValidate: true })
              }}
              className={cn(
                'overflow-hidden rounded-xl border bg-[#121212] text-left transition hover:-translate-y-0.5',
                selected === design.id ? 'border-gold shadow-[var(--glow-gold)]' : 'border-white/10',
              )}
            >
              <div
                className="h-20 bg-cover bg-center"
                style={{
                  background: design.preview ? undefined : design.gradient,
                  backgroundImage: design.preview ? `url(${design.preview})` : undefined,
                }}
              />
              <div className="flex items-center justify-between p-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">{design.name}</span>
                  {'category' in design && design.category ? (
                    <span className="block truncate text-[10px] text-white/35">{design.category}</span>
                  ) : null}
                </span>
                {selected === design.id && <Check className="h-4 w-4 text-gold" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

export function AccessSection({ onCopy }: { onCopy: (text: string, label: string) => void }) {
  const { register, watch } = useFormContext<EventFormValues>()
  const pin = watch('pin')
  return (
    <SectionCard title="Access" delay={0.16}>
      <div className="max-w-md">
        <Label>PIN</Label>
        <div className="flex gap-2">
          <input type="password" inputMode="numeric" className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20" {...register('pin')} />
          <Button type="button" variant="outline" size="icon" onClick={() => onCopy(pin, 'PIN')}><Copy className="h-4 w-4" /></Button>
        </div>
        <FieldError name="pin" />
      </div>
    </SectionCard>
  )
}

export function PublishSection({
  onPreview,
  onDraft,
  onPublish,
}: {
  onPreview: () => void
  onDraft: () => void
  onPublish: () => void
}) {
  return (
    <SectionCard title="Publish" delay={0.18}>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={onPreview}>Preview Event</Button>
        <Button type="button" variant="outline" onClick={onDraft}>Save</Button>
        <Button type="button" variant="gold" onClick={onPublish}>Publish / Update</Button>
      </div>
    </SectionCard>
  )
}
