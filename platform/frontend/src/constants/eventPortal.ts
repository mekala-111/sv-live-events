import {
  LayoutDashboard,
  Sparkles,
  Radio,
  ListVideo,
  BarChart3,
  Clapperboard,
  Library,
  Calendar,
  Package,
  Users,
  Image,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Settings,
  LogOut,
  Palette,
  type LucideIcon,
} from 'lucide-react'
import type { EventFormValues, EventTheme } from '@/types/event'

export interface NavItem {
  id: string
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  danger?: boolean
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export const ADMIN_NAV: NavGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
      { id: 'events', label: 'Event Portal', to: '/admin/events', icon: Sparkles },
      { id: 'themes', label: 'Theme Builder', to: '/admin/themes', icon: Palette },
      { id: 'ops', label: 'Live Events', to: '/admin/ops', icon: Radio },
      { id: 'cluster', label: 'Stream Queue', to: '/admin/cluster', icon: ListVideo },
      { id: 'analytics', label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
      { id: 'studio', label: 'Broadcasts', to: '/admin/studio', icon: Clapperboard },
      { id: 'library', label: 'Video Library', to: '/admin/library', icon: Library },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      { id: 'bookings', label: 'Bookings', to: '/admin/bookings', icon: Calendar },
      { id: 'packages', label: 'Packages', to: '/admin/packages', icon: Package },
      { id: 'customers', label: 'Customers', to: '/admin/customers', icon: Users },
      { id: 'gallery', label: 'Gallery', to: '/admin/gallery', icon: Image },
      { id: 'testimonials', label: 'Testimonials', to: '/admin/testimonials', icon: MessageSquare },
      { id: 'faq', label: 'FAQs', to: '/admin/settings', icon: HelpCircle },
      { id: 'blogs', label: 'Blog', to: '/admin/blogs', icon: BookOpen },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { id: 'settings', label: 'Settings', to: '/admin/settings', icon: Settings },
      { id: 'logout', label: 'Logout', to: '#logout', icon: LogOut, danger: true },
    ],
  },
]

export const CATEGORIES = [
  { value: 'Marriage', label: 'Marriage' },
  { value: 'Reunion', label: 'Reunion' },
  { value: 'Other', label: 'Other' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'concert', label: 'Concert' },
  { value: 'temple', label: 'Temple' },
  { value: 'sports', label: 'Sports' },
  { value: 'baby-shower', label: 'Baby Shower' },
  { value: 'reception', label: 'Reception' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'housewarming', label: 'Housewarming' },
  { value: 'religious', label: 'Religious' },
]

export const SERVICE_OPTIONS = [{ value: 'youtube', label: 'YouTube' }]

export const YOUTUBE_CHANNELS = [
  { value: '', label: 'Select a channel' },
  { value: 'sv-live-events', label: 'SV Live Events' },
]

export const FONT_STYLES = [
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Cinzel', label: 'Cinzel' },
  { value: 'Great Vibes', label: 'Great Vibes' },
]

export const WEBSITE_DESIGNS: EventTheme[] = [
  { id: 'theme-1', name: 'NewStyle6', gradient: 'linear-gradient(135deg,#fff8f2,#c45c26)' },
  { id: 'cream-02-wedding', name: 'Wedding Classic', gradient: 'linear-gradient(135deg,#fffaf3,#9a3412)' },
  { id: 'cream-03-engagement', name: 'Engagement Rose', gradient: 'linear-gradient(135deg,#fce7f3,#be185d)' },
  { id: 'cream-04-reception', name: 'Reception Gold', gradient: 'linear-gradient(135deg,#fef3c7,#b45309)' },
]

export const SUB_CATEGORIES: Record<string, { value: string; label: string }[]> = {
  wedding: [
    { value: 'traditional', label: 'Traditional Wedding' },
    { value: 'destination', label: 'Destination Wedding' },
    { value: 'reception', label: 'Wedding Reception' },
  ],
  birthday: [
    { value: 'kids', label: 'Kids Birthday' },
    { value: 'milestone', label: 'Milestone Birthday' },
  ],
  corporate: [
    { value: 'conference', label: 'Conference' },
    { value: 'product-launch', label: 'Product Launch' },
  ],
  concert: [
    { value: 'live-music', label: 'Live Music' },
    { value: 'festival', label: 'Festival' },
  ],
  default: [{ value: 'general', label: 'General' }],
}

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'te', label: 'Telugu' },
  { value: 'ta', label: 'Tamil' },
  { value: 'kn', label: 'Kannada' },
]

export const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

export const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'unlisted', label: 'Unlisted' },
]

export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
]

export const STREAM_TYPES = [
  { value: 'rtmp', label: 'RTMP' },
  { value: 'webrtc', label: 'WebRTC' },
  { value: 'external', label: 'External Link' },
]

export const VIDEO_QUALITIES = [
  { value: '720p', label: '720p HD' },
  { value: '1080p', label: '1080p Full HD' },
  { value: '1440p', label: '1440p QHD' },
  { value: '4k', label: '4K Ultra HD' },
]

export const LATENCY_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low Latency' },
  { value: 'ultra-low', label: 'Ultra Low' },
]

export const UPLOAD_SLOTS = [
  { id: 'logo', label: 'Event Logo', hint: 'Square, PNG/SVG' },
  { id: 'cover', label: 'Event Cover', hint: '1920×1080' },
  { id: 'thumbnail', label: 'Event Thumbnail', hint: '1280×720' },
  { id: 'background', label: 'Background', hint: 'Full bleed' },
  { id: 'sponsor', label: 'Sponsor Banner', hint: 'Wide banner' },
  { id: 'seo', label: 'SEO / Social Image', hint: '1200×630' },
]

export const EVENT_THEMES: EventTheme[] = [
  { id: 'wedding', name: 'Wedding', gradient: 'linear-gradient(135deg,#3d1a2a,#f7b733)' },
  { id: 'birthday', name: 'Birthday', gradient: 'linear-gradient(135deg,#1a2a4d,#ff6b9d)' },
  { id: 'corporate', name: 'Corporate', gradient: 'linear-gradient(135deg,#0f172a,#38bdf8)' },
  { id: 'concert', name: 'Concert', gradient: 'linear-gradient(135deg,#1a0533,#ff8a00)' },
  { id: 'temple', name: 'Temple', gradient: 'linear-gradient(135deg,#2a1508,#f7b733)' },
  { id: 'sports', name: 'Sports', gradient: 'linear-gradient(135deg,#052e16,#22c55e)' },
  { id: 'baby-shower', name: 'Baby Shower', gradient: 'linear-gradient(135deg,#1e1b4b,#a78bfa)' },
  { id: 'reception', name: 'Reception', gradient: 'linear-gradient(135deg,#1c1917,#d4a574)' },
  { id: 'engagement', name: 'Engagement', gradient: 'linear-gradient(135deg,#3b0764,#f472b6)' },
  { id: 'housewarming', name: 'Housewarming', gradient: 'linear-gradient(135deg,#14532d,#84cc16)' },
  { id: 'religious', name: 'Religious', gradient: 'linear-gradient(135deg,#451a03,#fbbf24)' },
  { id: 'custom', name: 'Custom', gradient: 'linear-gradient(135deg,#161616,#333)' },
]

export const SOCIAL_PLATFORMS = [
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/…' },
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
  { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/…' },
  { id: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/…' },
  { id: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/…' },
  { id: 'website', label: 'Website', placeholder: 'https://…' },
]

export const LIVE_FEATURES = [
  { id: 'chat', label: 'Enable Chat' },
  { id: 'gifts', label: 'Enable Gifts' },
  { id: 'emoji', label: 'Enable Emoji' },
  { id: 'donations', label: 'Enable Donations' },
  { id: 'countdown', label: 'Enable Countdown' },
  { id: 'waitingScreen', label: 'Enable Waiting Screen' },
  { id: 'watermark', label: 'Enable Watermark' },
  { id: 'overlay', label: 'Enable Overlay' },
  { id: 'recording', label: 'Enable Recording' },
  { id: 'polls', label: 'Enable Polls' },
  { id: 'qa', label: 'Enable Q&A' },
]

export const DETAIL_FIELDS = [
  { id: 'description', label: 'Description', type: 'textarea' as const, rows: 4 },
  { id: 'shortDescription', label: 'Short Description', type: 'textarea' as const, rows: 2 },
  { id: 'agenda', label: 'Agenda', type: 'textarea' as const, rows: 3 },
  { id: 'speakers', label: 'Speakers / Hosts', type: 'textarea' as const, rows: 2 },
  { id: 'venue', label: 'Venue', type: 'text' as const },
  { id: 'mapEmbed', label: 'Google Maps Embed URL', type: 'text' as const },
  { id: 'address', label: 'Address', type: 'text' as const },
  { id: 'organizer', label: 'Organizer', type: 'text' as const },
  { id: 'sponsors', label: 'Sponsors', type: 'textarea' as const, rows: 2 },
]

export const DEFAULT_EVENT: EventFormValues = {
  serviceType: 'youtube',
  eventDate: '2026-07-30',
  liveTimings: 'Live Starts on 30 Jul, 2026 from 6:00 PM IST Onwards',
  rememberChoice: true,
  youtubeChannel: '',
  youtubeLiveUrl: '',
  youtubeLiveKey: '',
  teaserUrl: '',
  scrollMessage: '',
  watchLiveButton: true,
  socialShare: true,
  whatsappNumber: '',
  remarks1: '',
  remarks2: '',
  fontStyle: 'Outfit',
  fontColor: '#FFCC00',
  pin: '1234',
  websiteDesignId: 'theme-1',
  eventImages: [],
  logo: null,
  customImage: null,
  whatsappImage: null,
  name: 'Ravi weds Rani',
  slug: 'raviwedsrani',
  category: 'Marriage',
  subCategory: 'traditional',
  themeId: 'theme-1',
  language: 'en',
  status: 'published',
  privacy: 'public',
  bookingEnabled: true,
  startDate: '2026-08-15T18:00',
  endDate: '2026-08-15T23:30',
  countdownTitle: 'Ceremony begins in',
  timezone: 'Asia/Kolkata',
  streamType: 'rtmp',
  streamVisibility: 'private',
  rtmpUrl: 'rtmp://live.svliveevents.com/live',
  streamKey: 'sv-live-••••-••••-9f2a',
  backupStreamUrl: '',
  videoQuality: '1080p',
  latency: 'normal',
  enableDvr: true,
  autoRecording: true,
  viewerLimit: 5000,
  assets: Object.fromEntries(UPLOAD_SLOTS.map((s) => [s.id, null])),
  description: '',
  shortDescription: '',
  agenda: '',
  speakers: '',
  venue: 'Royal Palace Banquet Hall',
  mapEmbed: '',
  address: '',
  organizer: 'SV Live Events',
  sponsors: '',
  socials: Object.fromEntries(SOCIAL_PLATFORMS.map((s) => [s.id, ''])),
  features: Object.fromEntries(LIVE_FEATURES.map((f) => [f.id, ['chat', 'emoji', 'countdown', 'waitingScreen', 'recording'].includes(f.id)])),
  guestPassword: 'guest2026',
  vipPassword: 'vip-access',
  invitationLink: 'https://svliveevents.com/live/annual-grand-wedding-ceremony',
  registrationRequired: false,
  registrationFields: [
    { id: '1', label: 'Full Name', type: 'text', required: true },
    { id: '2', label: 'Email', type: 'email', required: true },
    { id: '3', label: 'Phone', type: 'phone', required: false },
  ],
  seoTitle: 'Annual Grand Wedding Ceremony | Live Stream',
  metaDescription: 'Watch the Annual Grand Wedding Ceremony live on SV Live Events.',
  keywords: ['wedding', 'live stream', 'ceremony'],
  ogTitle: '',
  ogDescription: '',
  twitterCard: 'summary_large_image',
  canonicalUrl: '',
}

export const MOCK_ANALYTICS = {
  expectedViewers: 5000,
  currentViewers: 1245,
  currentViewersDelta: 12.5,
  revenue: 245000,
  packagesSold: 85,
  trafficSources: [
    { name: 'Direct', value: 42, color: '#F7B733' },
    { name: 'Social', value: 28, color: '#FF8A00' },
    { name: 'Referral', value: 18, color: '#38bdf8' },
    { name: 'Others', value: 12, color: '#64748b' },
  ],
}
