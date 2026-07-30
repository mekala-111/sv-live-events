import { z } from 'zod'

export const eventSchema = z
  .object({
    name: z.string().min(3, 'Event name must be at least 3 characters'),
    slug: z
      .string()
      .min(3, 'Slug is required')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens'),
    category: z.string().min(1, 'Category is required'),
    subCategory: z.string().min(1, 'Sub category is required'),
    themeId: z.string().min(1),
    language: z.string().min(1),
    status: z.enum(['draft', 'published', 'scheduled', 'archived']),
    privacy: z.enum(['public', 'private', 'unlisted']),
    bookingEnabled: z.boolean(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    countdownTitle: z.string(),
    timezone: z.string().min(1),
    streamType: z.enum(['rtmp', 'webrtc', 'external']),
    streamVisibility: z.enum(['public', 'private', 'unlisted']),
    rtmpUrl: z.string(),
    streamKey: z.string(),
    backupStreamUrl: z.string(),
    videoQuality: z.string(),
    latency: z.string(),
    enableDvr: z.boolean(),
    autoRecording: z.boolean(),
    viewerLimit: z.coerce.number().min(0).max(1_000_000),
    assets: z.record(z.string().nullable()),
    description: z.string(),
    shortDescription: z.string().max(280, 'Keep under 280 characters'),
    agenda: z.string(),
    speakers: z.string(),
    venue: z.string(),
    mapEmbed: z.string(),
    address: z.string(),
    organizer: z.string(),
    sponsors: z.string(),
    socials: z.record(z.string()),
    features: z.record(z.boolean()),
    guestPassword: z.string(),
    vipPassword: z.string(),
    invitationLink: z.string().url('Must be a valid URL').or(z.literal('')),
    registrationRequired: z.boolean(),
    registrationFields: z.array(
      z.object({
        id: z.string(),
        label: z.string().min(1),
        type: z.enum(['text', 'email', 'phone', 'select', 'textarea']),
        required: z.boolean(),
        options: z.array(z.string()).optional(),
      }),
    ),
    seoTitle: z.string().max(70, 'Keep under 70 characters'),
    metaDescription: z.string().max(160, 'Keep under 160 characters'),
    keywords: z.array(z.string()),
    ogTitle: z.string(),
    ogDescription: z.string(),
    twitterCard: z.string(),
    canonicalUrl: z.string(),
  })
  .refine((d) => !d.startDate || !d.endDate || new Date(d.endDate) >= new Date(d.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  })

export type EventSchema = z.infer<typeof eventSchema>
