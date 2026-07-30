export type ThemeStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type ThemeLayer = {
  id: string
  name: string
  type: 'background' | 'overlay' | 'pattern' | 'particles' | 'floating' | 'frame' | 'foreground'
  visible: boolean
  opacity: number
  blendMode: string
  blur: number
  scale: number
  x: number
  y: number
  assetUrl?: string | null
}

export type ThemeAsset = {
  id?: string
  assetType: string
  assetPath: string
  label?: string | null
  positionX?: number
  positionY?: number
  opacity?: number
  blendMode?: string
  scale?: number
  blur?: number
  visible?: boolean
  sortOrder?: number
  metaJson?: string | null
  meta?: {
    fileSize?: number
    width?: number
    height?: number
    mime?: string
  }
}

export type EventThemeRecord = {
  id: string
  name: string
  slug: string
  category: string
  description?: string | null
  previewImage?: string | null
  desktopBackground?: string | null
  tabletBackground?: string | null
  mobileBackground?: string | null
  landscapeBackground?: string | null
  portraitBackground?: string | null
  waitingBackground?: string | null
  liveBackground?: string | null
  popupBackground?: string | null
  loginBackground?: string | null
  chatBackground?: string | null
  overlayImage?: string | null
  frameImage?: string | null
  particles?: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  cardColor: string
  glassColor: string
  buttonColor: string
  textColor: string
  borderColor: string
  glowColor: string
  gradientColors?: string[] | string | null
  fontHeading: string
  fontBody: string
  fontButton?: string | null
  fontCountdown?: string | null
  customFonts?: { name: string; url: string }[]
  customFontsJson?: string | null
  animationType: string
  animationSpeed: number
  animationDensity: number
  animationOpacity: number
  layers?: ThemeLayer[]
  layersJson?: string | null
  musicUrl?: string | null
  logoUrl?: string | null
  watermarkUrl?: string | null
  status: ThemeStatus
  createdAt?: string
  updatedAt?: string
  assets: ThemeAsset[]
}

export type ThemeFormValues = Omit<EventThemeRecord, 'id' | 'createdAt' | 'updatedAt' | 'customFonts' | 'layers'> & {
  id?: string
  layers: ThemeLayer[]
  gradientColors: string[]
  customFonts: { name: string; url: string }[]
}

export type PreviewDevice = 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'landscape' | 'portrait' | 'tv'
