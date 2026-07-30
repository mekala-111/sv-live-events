/** Ultra-premium cinematic live themes — one shell, 15 event palettes */

export type PremiumMood =
  | 'wedding'
  | 'birthday'
  | 'baby'
  | 'house'
  | 'religious'
  | 'graduation'
  | 'corporate'
  | 'concert'
  | 'sports'
  | 'awards'
  | 'anniversary'
  | 'engagement'
  | 'mehendi'
  | 'haldi'
  | 'reception'

export type PremiumThemeDef = {
  id: string
  mood: PremiumMood
  name: string
  category: string
  emoji: string
  from: string
  to: string
  accent: string
  accent2: string
  glow: string
  bg: string
  surface: string
  text: string
  muted: string
  border: string
  headingFont: 'cinzel' | 'playfair' | 'cormorant' | 'space'
  bodyFont: 'inter' | 'outfit'
  particle: 'petals' | 'confetti' | 'stars' | 'sparks' | 'dots' | 'orbs' | 'none'
  gifts: { id: string; label: string; icon: string }[]
  reactions: string[]
  footerLine: string
  heroOverlay: string
}

export const PREMIUM_THEMES: PremiumThemeDef[] = [
  {
    id: 'premium-wedding',
    mood: 'wedding',
    name: 'Wedding — Royal Luxury',
    category: 'Wedding',
    emoji: '💍',
    from: '#0a0a0a',
    to: '#c9a24d',
    accent: '#c9a24d',
    accent2: '#e8c4a8',
    glow: 'rgba(201,162,77,0.45)',
    bg: '#070605',
    surface: 'rgba(20,16,12,0.72)',
    text: '#f7f0e4',
    muted: 'rgba(247,240,228,0.55)',
    border: 'rgba(201,162,77,0.35)',
    headingFont: 'cinzel',
    bodyFont: 'outfit',
    particle: 'petals',
    gifts: [
      { id: 'rose', label: 'Rose Bouquet', icon: '🌹' },
      { id: 'ring', label: 'Golden Ring', icon: '💍' },
      { id: 'lotus', label: 'Lotus Blessing', icon: '🪷' },
      { id: 'crown', label: 'Royal Crown', icon: '👑' },
    ],
    reactions: ['👏', '❤️', '🌹', '✨', '🙏', '💐'],
    footerLine: 'A royal celebration — streamed in cinematic luxury',
    heroOverlay:
      'radial-gradient(ellipse at 20% 10%, rgba(201,162,77,0.28), transparent 45%), radial-gradient(ellipse at 80% 90%, rgba(232,196,168,0.12), transparent 40%), linear-gradient(180deg, #070605 0%, #120e0a 50%, #070605 100%)',
  },
  {
    id: 'premium-birthday',
    mood: 'birthday',
    name: 'Birthday — Luxe Celebration',
    category: 'Birthday',
    emoji: '🎂',
    from: '#0b0614',
    to: '#ff6b35',
    accent: '#ff6b35',
    accent2: '#f472b6',
    glow: 'rgba(255,107,53,0.4)',
    bg: '#08050f',
    surface: 'rgba(18,10,28,0.75)',
    text: '#fff5f0',
    muted: 'rgba(255,245,240,0.55)',
    border: 'rgba(255,107,53,0.35)',
    headingFont: 'playfair',
    bodyFont: 'outfit',
    particle: 'confetti',
    gifts: [
      { id: 'cake', label: 'Birthday Cake', icon: '🎂' },
      { id: 'balloon', label: 'Balloon Burst', icon: '🎈' },
      { id: 'gift', label: 'Luxury Gift', icon: '🎁' },
      { id: 'sparkler', label: 'Sparkler', icon: '🎇' },
    ],
    reactions: ['🎉', '🎂', '🔥', '💜', '✨', '🥳'],
    footerLine: 'Make a wish — the celebration is live',
    heroOverlay:
      'radial-gradient(ellipse at 30% 20%, rgba(244,114,182,0.25), transparent 40%), radial-gradient(ellipse at 70% 80%, rgba(255,107,53,0.2), transparent 45%), linear-gradient(160deg, #08050f, #1a0a24 50%, #0a0612)',
  },
  {
    id: 'premium-baby',
    mood: 'baby',
    name: 'Baby Shower — Soft Pastel',
    category: 'Baby Shower',
    emoji: '👶',
    from: '#f8fafc',
    to: '#7dd3fc',
    accent: '#38bdf8',
    accent2: '#f9a8d4',
    glow: 'rgba(56,189,248,0.35)',
    bg: '#0c1220',
    surface: 'rgba(15,23,42,0.7)',
    text: '#f0f9ff',
    muted: 'rgba(240,249,255,0.55)',
    border: 'rgba(125,211,252,0.3)',
    headingFont: 'cormorant',
    bodyFont: 'outfit',
    particle: 'stars',
    gifts: [
      { id: 'star', label: 'Wishing Star', icon: '⭐' },
      { id: 'teddy', label: 'Teddy Hug', icon: '🧸' },
      { id: 'bottle', label: 'Baby Bottle', icon: '🍼' },
      { id: 'cloud', label: 'Soft Cloud', icon: '☁️' },
    ],
    reactions: ['👶', '💛', '⭐', '🧸', '✨', '🌙'],
    footerLine: 'Tiny toes, big love — soft & cinematic',
    heroOverlay:
      'radial-gradient(ellipse at 50% 0%, rgba(125,211,252,0.22), transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(249,168,212,0.15), transparent 40%), linear-gradient(180deg, #0c1220, #111827)',
  },
  {
    id: 'premium-house',
    mood: 'house',
    name: 'House Warming — Warm Welcome',
    category: 'House Warming',
    emoji: '🏠',
    from: '#1c1917',
    to: '#ea580c',
    accent: '#f97316',
    accent2: '#fbbf24',
    glow: 'rgba(249,115,22,0.4)',
    bg: '#0c0a09',
    surface: 'rgba(28,25,23,0.75)',
    text: '#fff7ed',
    muted: 'rgba(255,247,237,0.55)',
    border: 'rgba(249,115,22,0.35)',
    headingFont: 'cinzel',
    bodyFont: 'outfit',
    particle: 'orbs',
    gifts: [
      { id: 'key', label: 'Golden Key', icon: '🔑' },
      { id: 'lamp', label: 'Diya Light', icon: '🪔' },
      { id: 'plant', label: 'Welcome Plant', icon: '🪴' },
      { id: 'home', label: 'Home Blessing', icon: '🏡' },
    ],
    reactions: ['🏠', '🪔', '🙏', '🧡', '✨', '🔑'],
    footerLine: 'New walls, warm hearts — Griha Pravesh live',
    heroOverlay:
      'radial-gradient(ellipse at 40% 30%, rgba(251,191,36,0.2), transparent 45%), radial-gradient(ellipse at 80% 70%, rgba(249,115,22,0.18), transparent 40%), linear-gradient(180deg, #0c0a09, #1c1410)',
  },
  {
    id: 'premium-religious',
    mood: 'religious',
    name: 'Religious — Divine Glow',
    category: 'Religious Event',
    emoji: '🙏',
    from: '#1a1008',
    to: '#d4a017',
    accent: '#eab308',
    accent2: '#fde68a',
    glow: 'rgba(234,179,8,0.4)',
    bg: '#0a0804',
    surface: 'rgba(24,18,8,0.78)',
    text: '#fffbeb',
    muted: 'rgba(255,251,235,0.55)',
    border: 'rgba(234,179,8,0.35)',
    headingFont: 'cinzel',
    bodyFont: 'outfit',
    particle: 'sparks',
    gifts: [
      { id: 'lotus', label: 'Divine Lotus', icon: '🪷' },
      { id: 'diya', label: 'Sacred Diya', icon: '🪔' },
      { id: 'flower', label: 'Temple Flower', icon: '🌺' },
      { id: 'om', label: 'Om Blessing', icon: '🕉️' },
    ],
    reactions: ['🙏', '🪔', '🪷', '✨', '🌺', '🕉️'],
    footerLine: 'Sacred moments, streamed with reverence',
    heroOverlay:
      'radial-gradient(ellipse at 50% 20%, rgba(234,179,8,0.28), transparent 48%), radial-gradient(ellipse at 30% 90%, rgba(253,230,138,0.1), transparent 40%), linear-gradient(180deg, #0a0804, #1a1208)',
  },
  {
    id: 'premium-graduation',
    mood: 'graduation',
    name: 'Graduation — Academic Prestige',
    category: 'Graduation',
    emoji: '🎓',
    from: '#0f172a',
    to: '#2563eb',
    accent: '#3b82f6',
    accent2: '#93c5fd',
    glow: 'rgba(59,130,246,0.4)',
    bg: '#020617',
    surface: 'rgba(15,23,42,0.75)',
    text: '#eff6ff',
    muted: 'rgba(239,246,255,0.55)',
    border: 'rgba(59,130,246,0.35)',
    headingFont: 'playfair',
    bodyFont: 'outfit',
    particle: 'stars',
    gifts: [
      { id: 'cap', label: 'Grad Cap', icon: '🎓' },
      { id: 'medal', label: 'Merit Medal', icon: '🏅' },
      { id: 'book', label: 'Knowledge', icon: '📚' },
      { id: 'star', label: 'Star Scholar', icon: '⭐' },
    ],
    reactions: ['🎓', '👏', '💙', '⭐', '🎉', '📚'],
    footerLine: 'Proud moments — celebrate the milestone live',
    heroOverlay:
      'radial-gradient(ellipse at 25% 15%, rgba(59,130,246,0.28), transparent 45%), linear-gradient(160deg, #020617, #0f172a 60%, #020617)',
  },
  {
    id: 'premium-corporate',
    mood: 'corporate',
    name: 'Corporate — Executive Glass',
    category: 'Corporate',
    emoji: '💼',
    from: '#0b1220',
    to: '#38bdf8',
    accent: '#0ea5e9',
    accent2: '#e2e8f0',
    glow: 'rgba(14,165,233,0.35)',
    bg: '#020617',
    surface: 'rgba(15,23,42,0.8)',
    text: '#f8fafc',
    muted: 'rgba(248,250,252,0.5)',
    border: 'rgba(14,165,233,0.28)',
    headingFont: 'space',
    bodyFont: 'inter',
    particle: 'dots',
    gifts: [
      { id: 'clap', label: 'Applause', icon: '👏' },
      { id: 'rocket', label: 'Launch', icon: '🚀' },
      { id: 'chart', label: 'Growth', icon: '📈' },
      { id: 'bolt', label: 'Insight', icon: '⚡' },
    ],
    reactions: ['👏', '🚀', '💡', '🔥', '✅', '📈'],
    footerLine: 'Executive-grade live streaming',
    heroOverlay:
      'radial-gradient(ellipse at 70% 10%, rgba(14,165,233,0.2), transparent 40%), linear-gradient(180deg, #020617, #0b1220 50%, #020617)',
  },
  {
    id: 'premium-concert',
    mood: 'concert',
    name: 'Concert — Stage Production',
    category: 'Concert',
    emoji: '🎵',
    from: '#050505',
    to: '#a855f7',
    accent: '#c026d3',
    accent2: '#fb923c',
    glow: 'rgba(192,38,211,0.45)',
    bg: '#030303',
    surface: 'rgba(12,8,20,0.78)',
    text: '#faf5ff',
    muted: 'rgba(250,245,255,0.55)',
    border: 'rgba(192,38,211,0.4)',
    headingFont: 'space',
    bodyFont: 'outfit',
    particle: 'sparks',
    gifts: [
      { id: 'mic', label: 'Encore Mic', icon: '🎤' },
      { id: 'fire', label: 'Stage Fire', icon: '🔥' },
      { id: 'notes', label: 'Music Wave', icon: '🎶' },
      { id: 'laser', label: 'Laser Show', icon: '💫' },
    ],
    reactions: ['🔥', '🎵', '💜', '🙌', '✨', '🎤'],
    footerLine: 'Arena energy — lights, lasers, live',
    heroOverlay:
      'radial-gradient(ellipse at 50% 100%, rgba(192,38,211,0.35), transparent 50%), radial-gradient(ellipse at 20% 20%, rgba(251,146,60,0.2), transparent 40%), linear-gradient(180deg, #030303, #12081c)',
  },
  {
    id: 'premium-sports',
    mood: 'sports',
    name: 'Sports — Stadium Energy',
    category: 'Sports',
    emoji: '⚽',
    from: '#052e16',
    to: '#22c55e',
    accent: '#22c55e',
    accent2: '#facc15',
    glow: 'rgba(34,197,94,0.4)',
    bg: '#020a04',
    surface: 'rgba(6,20,10,0.78)',
    text: '#f0fdf4',
    muted: 'rgba(240,253,244,0.55)',
    border: 'rgba(34,197,94,0.35)',
    headingFont: 'space',
    bodyFont: 'outfit',
    particle: 'orbs',
    gifts: [
      { id: 'trophy', label: 'Match Trophy', icon: '🏆' },
      { id: 'ball', label: 'Game Ball', icon: '⚽' },
      { id: 'fire', label: 'Crowd Fire', icon: '🔥' },
      { id: 'whistle', label: 'Whistle', icon: '📣' },
    ],
    reactions: ['⚽', '🔥', '👏', '🏆', '💪', '⚡'],
    footerLine: 'Stadium pulse — every second counts',
    heroOverlay:
      'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.25), transparent 45%), radial-gradient(ellipse at 80% 80%, rgba(250,204,21,0.12), transparent 40%), linear-gradient(180deg, #020a04, #06140a)',
  },
  {
    id: 'premium-awards',
    mood: 'awards',
    name: 'Awards — Red Carpet',
    category: 'Awards',
    emoji: '🏆',
    from: '#0a0a0a',
    to: '#dc2626',
    accent: '#f59e0b',
    accent2: '#ef4444',
    glow: 'rgba(245,158,11,0.45)',
    bg: '#050505',
    surface: 'rgba(15,10,10,0.8)',
    text: '#fffbeb',
    muted: 'rgba(255,251,235,0.55)',
    border: 'rgba(245,158,11,0.4)',
    headingFont: 'cinzel',
    bodyFont: 'outfit',
    particle: 'sparks',
    gifts: [
      { id: 'oscar', label: 'Golden Trophy', icon: '🏆' },
      { id: 'star', label: 'Spotlight', icon: '🌟' },
      { id: 'clap', label: 'Standing Ovation', icon: '👏' },
      { id: 'film', label: 'Cinema Reel', icon: '🎬' },
    ],
    reactions: ['🏆', '🌟', '👏', '✨', '❤️', '🎬'],
    footerLine: 'And the award goes to… live on the carpet',
    heroOverlay:
      'radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.3), transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(239,68,68,0.2), transparent 50%), linear-gradient(180deg, #050505, #120808)',
  },
  {
    id: 'premium-anniversary',
    mood: 'anniversary',
    name: 'Anniversary — Eternal Love',
    category: 'Anniversary',
    emoji: '❤️',
    from: '#1a0a10',
    to: '#e11d48',
    accent: '#fb7185',
    accent2: '#fbbf24',
    glow: 'rgba(251,113,133,0.4)',
    bg: '#0c0608',
    surface: 'rgba(24,10,14,0.78)',
    text: '#fff1f2',
    muted: 'rgba(255,241,242,0.55)',
    border: 'rgba(251,113,133,0.35)',
    headingFont: 'cormorant',
    bodyFont: 'outfit',
    particle: 'petals',
    gifts: [
      { id: 'heart', label: 'Eternal Heart', icon: '❤️' },
      { id: 'wine', label: 'Champagne', icon: '🥂' },
      { id: 'rose', label: 'Anniversary Rose', icon: '🌹' },
      { id: 'ring', label: 'Promise Ring', icon: '💍' },
    ],
    reactions: ['❤️', '🥂', '🌹', '✨', '💕', '🥰'],
    footerLine: 'Years of love — celebrated in gold light',
    heroOverlay:
      'radial-gradient(ellipse at 40% 20%, rgba(251,113,133,0.25), transparent 45%), radial-gradient(ellipse at 70% 80%, rgba(251,191,36,0.12), transparent 40%), linear-gradient(180deg, #0c0608, #1a0a10)',
  },
  {
    id: 'premium-engagement',
    mood: 'engagement',
    name: 'Engagement — Promise Glow',
    category: 'Engagement',
    emoji: '💑',
    from: '#1a0a14',
    to: '#db2777',
    accent: '#ec4899',
    accent2: '#f9a8d4',
    glow: 'rgba(236,72,153,0.4)',
    bg: '#0c0610',
    surface: 'rgba(28,10,22,0.78)',
    text: '#fdf2f8',
    muted: 'rgba(253,242,248,0.55)',
    border: 'rgba(236,72,153,0.35)',
    headingFont: 'cormorant',
    bodyFont: 'outfit',
    particle: 'petals',
    gifts: [
      { id: 'ring', label: 'Promise Ring', icon: '💎' },
      { id: 'heart', label: 'Love Note', icon: '💌' },
      { id: 'sparkle', label: 'Diamond Spark', icon: '✨' },
      { id: 'couple', label: 'Couple Blessing', icon: '💑' },
    ],
    reactions: ['💍', '💖', '✨', '🥰', '💐', '💎'],
    footerLine: 'The promise begins — live & luminous',
    heroOverlay:
      'radial-gradient(ellipse at 50% 15%, rgba(236,72,153,0.28), transparent 45%), linear-gradient(180deg, #0c0610, #1a0a14)',
  },
  {
    id: 'premium-mehendi',
    mood: 'mehendi',
    name: 'Mehendi — Henna Garden',
    category: 'Mehendi',
    emoji: '🌸',
    from: '#052e16',
    to: '#16a34a',
    accent: '#22c55e',
    accent2: '#86efac',
    glow: 'rgba(34,197,94,0.35)',
    bg: '#04140a',
    surface: 'rgba(6,28,14,0.78)',
    text: '#f0fdf4',
    muted: 'rgba(240,253,244,0.55)',
    border: 'rgba(34,197,94,0.35)',
    headingFont: 'cormorant',
    bodyFont: 'outfit',
    particle: 'petals',
    gifts: [
      { id: 'henna', label: 'Henna Art', icon: '🌿' },
      { id: 'flower', label: 'Mehendi Flower', icon: '🌸' },
      { id: 'mirror', label: 'Bridal Mirror', icon: '🪞' },
      { id: 'bangle', label: 'Glass Bangles', icon: '💫' },
    ],
    reactions: ['🌸', '🌿', '💚', '✨', '🙏', '💛'],
    footerLine: 'Patterns of joy — mehendi in bloom',
    heroOverlay:
      'radial-gradient(ellipse at 30% 20%, rgba(34,197,94,0.22), transparent 45%), radial-gradient(ellipse at 80% 70%, rgba(134,239,172,0.1), transparent 40%), linear-gradient(180deg, #04140a, #0a1f10)',
  },
  {
    id: 'premium-haldi',
    mood: 'haldi',
    name: 'Haldi — Turmeric Glow',
    category: 'Haldi',
    emoji: '🟡',
    from: '#1c1408',
    to: '#eab308',
    accent: '#facc15',
    accent2: '#fde68a',
    glow: 'rgba(250,204,21,0.45)',
    bg: '#0c0a04',
    surface: 'rgba(28,22,8,0.78)',
    text: '#fefce8',
    muted: 'rgba(254,252,232,0.55)',
    border: 'rgba(250,204,21,0.4)',
    headingFont: 'cinzel',
    bodyFont: 'outfit',
    particle: 'confetti',
    gifts: [
      { id: 'haldi', label: 'Haldi Bowl', icon: '🟡' },
      { id: 'marigold', label: 'Marigold', icon: '🏵️' },
      { id: 'splash', label: 'Color Splash', icon: '💦' },
      { id: 'drum', label: 'Dhol Beat', icon: '🥁' },
    ],
    reactions: ['🟡', '☀️', '🎉', '🏵️', '💛', '✨'],
    footerLine: 'Golden turmeric, golden memories',
    heroOverlay:
      'radial-gradient(ellipse at 40% 25%, rgba(250,204,21,0.3), transparent 48%), linear-gradient(180deg, #0c0a04, #1c1408)',
  },
  {
    id: 'premium-reception',
    mood: 'reception',
    name: 'Reception — Evening Grandeur',
    category: 'Reception',
    emoji: '🎉',
    from: '#0a0a12',
    to: '#a78bfa',
    accent: '#c4b5fd',
    accent2: '#fbbf24',
    glow: 'rgba(196,181,253,0.4)',
    bg: '#06060c',
    surface: 'rgba(14,12,24,0.78)',
    text: '#f5f3ff',
    muted: 'rgba(245,243,255,0.55)',
    border: 'rgba(196,181,253,0.35)',
    headingFont: 'playfair',
    bodyFont: 'outfit',
    particle: 'sparks',
    gifts: [
      { id: 'toast', label: 'Champagne Toast', icon: '🥂' },
      { id: 'dance', label: 'First Dance', icon: '💃' },
      { id: 'sparkle', label: 'Grand Sparkle', icon: '✨' },
      { id: 'gift', label: 'Guest Gift', icon: '🎁' },
    ],
    reactions: ['🎉', '🥂', '✨', '💜', '💃', '🥰'],
    footerLine: 'An evening of grandeur — reception live',
    heroOverlay:
      'radial-gradient(ellipse at 50% 10%, rgba(196,181,253,0.25), transparent 45%), radial-gradient(ellipse at 20% 80%, rgba(251,191,36,0.12), transparent 40%), linear-gradient(180deg, #06060c, #120e1c)',
  },
]

const EVENT_TYPE_MAP: Record<string, string> = {
  Marriage: 'premium-wedding',
  Wedding: 'premium-wedding',
  'Marriage-Events': 'premium-wedding',
  muslimswedding: 'premium-wedding',
  birthday: 'premium-birthday',
  Birthday: 'premium-birthday',
  babyshower: 'premium-baby',
  'Baby Shower': 'premium-baby',
  seemantham: 'premium-baby',
  cradleceremony: 'premium-baby',
  gruhapravesham: 'premium-house',
  'House Warming': 'premium-house',
  Housewarming: 'premium-house',
  padipooja: 'premium-religious',
  devotional: 'premium-religious',
  church: 'premium-religious',
  Graduation: 'premium-graduation',
  Corporate: 'premium-corporate',
  Concert: 'premium-concert',
  Sports: 'premium-sports',
  Awards: 'premium-awards',
  Anniversary: 'premium-anniversary',
  Engagement: 'premium-engagement',
  Mehendi: 'premium-mehendi',
  Haldi: 'premium-haldi',
  Reception: 'premium-reception',
  halfsareeinvitation: 'premium-reception',
  vonifunction: 'premium-reception',
}

export function getPremiumTheme(designId?: string | null, eventType?: string | null): PremiumThemeDef {
  if (designId) {
    const byId = PREMIUM_THEMES.find((t) => t.id === designId)
    if (byId) return byId
  }
  if (eventType) {
    const mapped = EVENT_TYPE_MAP[eventType]
    if (mapped) {
      const t = PREMIUM_THEMES.find((x) => x.id === mapped)
      if (t) return t
    }
  }
  return PREMIUM_THEMES[0]
}

export function isPremiumTheme(designId?: string | null): boolean {
  if (!designId) return true
  if (designId.startsWith('cream-') || designId === 'theme-1') return false
  return designId.startsWith('premium-') || PREMIUM_THEMES.some((t) => t.id === designId)
}
