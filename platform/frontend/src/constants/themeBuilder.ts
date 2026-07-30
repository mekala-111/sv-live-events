import type { ThemeFormValues, ThemeLayer } from '@/types/theme'

export const THEME_CATEGORIES = [
  'Wedding',
  'Birthday',
  'Reception',
  'Engagement',
  'Haldi',
  'Mehendi',
  'Baby Shower',
  'Naming Ceremony',
  'House Warming',
  'Corporate',
  'Conference',
  'Concert',
  'Political',
  'Temple',
  'Religious',
  'Festival',
  'Sports',
  'Graduation',
  'School',
  'College',
  'Custom',
] as const

export const BACKGROUND_SLOTS = [
  { id: 'desktopBackground', label: 'Desktop Background' },
  { id: 'tabletBackground', label: 'Tablet Background' },
  { id: 'mobileBackground', label: 'Mobile Background' },
  { id: 'landscapeBackground', label: 'Landscape Background' },
  { id: 'portraitBackground', label: 'Portrait Background' },
  { id: 'waitingBackground', label: 'Waiting Screen Background' },
  { id: 'liveBackground', label: 'Live Streaming Background' },
  { id: 'popupBackground', label: 'Popup Background' },
  { id: 'loginBackground', label: 'Login Background' },
  { id: 'chatBackground', label: 'Chat Background' },
] as const

export const ASSET_TYPES = [
  'logo',
  'watermark',
  'frame',
  'corner',
  'floral',
  'mandap',
  'temple',
  'clouds',
  'balloons',
  'confetti',
  'fireworks',
  'sparkles',
  'leaves',
  'lotus',
  'rangoli',
  'stage-lights',
  'led',
  'smoke',
  'laser',
  'crowd',
  'icons',
  'borders',
  'buttons',
  'loader',
  'music',
] as const

export const COLOR_FIELDS = [
  { id: 'primaryColor', label: 'Primary' },
  { id: 'secondaryColor', label: 'Secondary' },
  { id: 'accentColor', label: 'Accent' },
  { id: 'backgroundColor', label: 'Background' },
  { id: 'cardColor', label: 'Card' },
  { id: 'glassColor', label: 'Glass' },
  { id: 'buttonColor', label: 'Button' },
  { id: 'textColor', label: 'Text' },
  { id: 'borderColor', label: 'Border' },
  { id: 'glowColor', label: 'Glow' },
] as const

export const FONT_OPTIONS = [
  'Space Grotesk',
  'Outfit',
  'Playfair Display',
  'Cinzel',
  'Cormorant Garamond',
  'Inter',
  'Lora',
  'Great Vibes',
  'Montserrat',
  'Poppins',
]

export const ANIMATION_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'particles', label: 'Floating Particles' },
  { value: 'petals', label: 'Petals' },
  { value: 'fireflies', label: 'Fireflies' },
  { value: 'confetti', label: 'Confetti' },
  { value: 'fireworks', label: 'Fireworks' },
  { value: 'clouds', label: 'Cloud Movement' },
  { value: 'smoke', label: 'Smoke' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'stars', label: 'Stars' },
  { value: 'light-rays', label: 'Light Rays' },
  { value: 'laser', label: 'Laser' },
  { value: 'rain', label: 'Rain' },
  { value: 'snow', label: 'Snow' },
]

export const BLEND_MODES = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'soft-light',
  'hard-light',
  'difference',
  'exclusion',
]

export const DEFAULT_LAYERS: ThemeLayer[] = [
  { id: 'layer-1', name: 'Main Background', type: 'background', visible: true, opacity: 1, blendMode: 'normal', blur: 0, scale: 1, x: 0, y: 0 },
  { id: 'layer-2', name: 'Overlay Gradient', type: 'overlay', visible: true, opacity: 0.5, blendMode: 'multiply', blur: 0, scale: 1, x: 0, y: 0 },
  { id: 'layer-3', name: 'Decorative Pattern', type: 'pattern', visible: false, opacity: 0.35, blendMode: 'overlay', blur: 0, scale: 1, x: 0, y: 0 },
  { id: 'layer-4', name: 'Particles', type: 'particles', visible: true, opacity: 0.7, blendMode: 'screen', blur: 0, scale: 1, x: 0, y: 0 },
  { id: 'layer-5', name: 'Floating Elements', type: 'floating', visible: false, opacity: 0.8, blendMode: 'normal', blur: 0, scale: 1, x: 0, y: 0 },
  { id: 'layer-6', name: 'Frame', type: 'frame', visible: true, opacity: 1, blendMode: 'normal', blur: 0, scale: 1, x: 0, y: 0 },
  { id: 'layer-7', name: 'Foreground Decorations', type: 'foreground', visible: false, opacity: 0.9, blendMode: 'normal', blur: 0, scale: 1, x: 0, y: 0 },
]

export const PREVIEW_DEVICES = [
  { id: 'desktop', label: 'Desktop', width: 1280, height: 720 },
  { id: 'laptop', label: 'Laptop', width: 1024, height: 640 },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
  { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
  { id: 'landscape', label: 'Landscape', width: 844, height: 390 },
  { id: 'portrait', label: 'Portrait', width: 390, height: 700 },
  { id: 'tv', label: 'TV', width: 1280, height: 720 },
] as const

export const ACCEPT_UPLOAD = '.jpg,.jpeg,.png,.webp,.svg,.mp4,.webm,.json'

export function defaultThemeForm(partial?: Partial<ThemeFormValues>): ThemeFormValues {
  return {
    name: 'Untitled Theme',
    slug: 'untitled-theme',
    category: 'Wedding',
    description: '',
    previewImage: null,
    desktopBackground: null,
    tabletBackground: null,
    mobileBackground: null,
    landscapeBackground: null,
    portraitBackground: null,
    waitingBackground: null,
    liveBackground: null,
    popupBackground: null,
    loginBackground: null,
    chatBackground: null,
    overlayImage: null,
    frameImage: null,
    particles: null,
    primaryColor: '#F7B733',
    secondaryColor: '#FF8A00',
    accentColor: '#F7B733',
    backgroundColor: '#080808',
    cardColor: '#161616',
    glassColor: 'rgba(22,22,22,0.85)',
    buttonColor: '#F7B733',
    textColor: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.08)',
    glowColor: 'rgba(247,183,51,0.25)',
    gradientColors: ['#080808', '#F7B733', '#FF8A00'],
    fontHeading: 'Space Grotesk',
    fontBody: 'Outfit',
    fontButton: 'Outfit',
    fontCountdown: 'Space Grotesk',
    customFonts: [],
    animationType: 'petals',
    animationSpeed: 1,
    animationDensity: 1,
    animationOpacity: 0.65,
    layers: structuredClone(DEFAULT_LAYERS),
    musicUrl: null,
    logoUrl: null,
    watermarkUrl: null,
    status: 'DRAFT',
    assets: [],
    ...partial,
  }
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64)
}
