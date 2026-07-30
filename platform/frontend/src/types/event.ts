export type EventStatus = 'draft' | 'published' | 'scheduled' | 'archived'
export type EventPrivacy = 'public' | 'private' | 'unlisted'
export type StreamType = 'rtmp' | 'webrtc' | 'external'

export interface EventTheme {
  id: string
  name: string
  gradient: string
  preview?: string
}

export interface UploadAsset {
  id: string
  label: string
  url: string | null
  file?: File | null
}

export interface RegistrationField {
  id: string
  label: string
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea'
  required: boolean
  options?: string[]
}

export interface SocialLink {
  id: string
  platform: string
  url: string
}

export interface LiveFeature {
  id: string
  label: string
  enabled: boolean
}

export interface EventAnalytics {
  expectedViewers: number
  currentViewers: number
  currentViewersDelta: number
  revenue: number
  packagesSold: number
  trafficSources: { name: string; value: number; color: string }[]
}

export interface EventFormValues {
  serviceType: 'youtube'
  eventDate: string
  liveTimings: string
  rememberChoice: boolean
  youtubeChannel: string
  youtubeLiveUrl: string
  youtubeLiveKey: string
  teaserUrl: string
  scrollMessage: string
  watchLiveButton: boolean
  socialShare: boolean
  whatsappNumber: string
  remarks1: string
  remarks2: string
  fontStyle: string
  fontColor: string
  pin: string
  websiteDesignId: string
  eventImages: string[]
  logo: string | null
  customImage: string | null
  whatsappImage: string | null
  name: string
  slug: string
  category: string
  subCategory: string
  themeId: string
  language: string
  status: EventStatus
  privacy: EventPrivacy
  bookingEnabled: boolean
  startDate: string
  endDate: string
  countdownTitle: string
  timezone: string
  streamType: StreamType
  streamVisibility: EventPrivacy
  rtmpUrl: string
  streamKey: string
  backupStreamUrl: string
  videoQuality: string
  latency: string
  enableDvr: boolean
  autoRecording: boolean
  viewerLimit: number
  assets: Record<string, string | null>
  description: string
  shortDescription: string
  agenda: string
  speakers: string
  venue: string
  mapEmbed: string
  address: string
  organizer: string
  sponsors: string
  socials: Record<string, string>
  features: Record<string, boolean>
  guestPassword: string
  vipPassword: string
  invitationLink: string
  registrationRequired: boolean
  registrationFields: RegistrationField[]
  seoTitle: string
  metaDescription: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  twitterCard: string
  canonicalUrl: string
}

export interface EventPayload extends EventFormValues {
  id?: string
  updatedAt?: string
}
