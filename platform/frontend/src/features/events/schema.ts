import { z } from 'zod'

const youtubeUrl = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) return true
      try {
        const url = new URL(value)
        const host = url.hostname.replace(/^www\./, '')
        return host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')
      } catch {
        return false
      }
    },
    'Enter a valid YouTube URL',
  )

export const eventSchema = z.object({
  serviceType: z.literal('youtube'),
  eventDate: z.string().min(1, 'Event date is required'),
  category: z.string().min(1, 'Event type is required'),
  themeId: z.string().min(1, 'Design is required'),
  websiteDesignId: z.string().min(1, 'Website design is required'),
  name: z.string().min(3, 'Page title is required').max(80, 'Keep under 80 characters'),
  slug: z
    .string()
    .min(3, 'Domain name is required')
    .max(48, 'Keep under 48 characters')
    .regex(/^[a-z0-9]+$/, 'Use lowercase letters and numbers only, no spaces'),
  rememberChoice: z.boolean(),
  liveTimings: z.string().max(160, 'Keep under 160 characters'),
  bookingEnabled: z.boolean(),
  youtubeChannel: z.string(),
  youtubeLiveUrl: youtubeUrl,
  youtubeLiveKey: z.string().max(200, 'Keep under 200 characters'),
  teaserUrl: youtubeUrl,
  scrollMessage: z.string().max(140, 'Keep under 140 characters'),
  eventImages: z.array(z.string()).max(10, 'Maximum 10 images'),
  logo: z.string().nullable(),
  customImage: z.string().nullable(),
  whatsappImage: z.string().nullable(),
  watchLiveButton: z.boolean(),
  socialShare: z.boolean(),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$|^$/, 'Enter a valid WhatsApp number with country code'),
  remarks1: z.string().max(500, 'Keep under 500 characters'),
  remarks2: z.string().max(500, 'Keep under 500 characters'),
  fontStyle: z.string().min(1, 'Choose a font'),
  fontColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Use a valid hex color'),
  pin: z.string().regex(/^\d{4,8}$/, 'PIN must be 4 to 8 digits'),
})

export type EventSchema = z.infer<typeof eventSchema>
