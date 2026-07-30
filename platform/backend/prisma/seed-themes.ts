import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const themes = [
  {
    name: 'Royal Wedding',
    slug: 'royal-wedding',
    category: 'Wedding',
    description: 'Deep black and gold luxury wedding stream theme',
    previewImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    desktopBackground: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920',
    mobileBackground: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    waitingBackground: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600',
    primaryColor: '#F7B733',
    secondaryColor: '#FF8A00',
    accentColor: '#E8C4A8',
    backgroundColor: '#080808',
    cardColor: '#161616',
    textColor: '#F7F0E4',
    glowColor: 'rgba(247,183,51,0.35)',
    gradientColors: JSON.stringify(['#080808', '#F7B733', '#FF8A00']),
    fontHeading: 'Cinzel',
    fontBody: 'Outfit',
    animationType: 'petals',
    animationSpeed: 1,
    status: 'PUBLISHED',
    layersJson: JSON.stringify([
      { id: 'bg', name: 'Main Background', type: 'background', visible: true, opacity: 1, blendMode: 'normal', blur: 0, scale: 1, x: 0, y: 0 },
      { id: 'overlay', name: 'Overlay Gradient', type: 'overlay', visible: true, opacity: 0.55, blendMode: 'multiply', blur: 0, scale: 1, x: 0, y: 0 },
      { id: 'particles', name: 'Particles', type: 'particles', visible: true, opacity: 0.7, blendMode: 'screen', blur: 0, scale: 1, x: 0, y: 0 },
      { id: 'frame', name: 'Frame', type: 'frame', visible: true, opacity: 1, blendMode: 'normal', blur: 0, scale: 1, x: 0, y: 0 },
    ]),
    assets: {
      create: [
        { assetType: 'floral', assetPath: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400', label: 'Floral corner', sortOrder: 0, opacity: 0.85 },
        { assetType: 'frame', assetPath: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400', label: 'Ornate frame', sortOrder: 1 },
      ],
    },
  },
  {
    name: 'Birthday Luxe',
    slug: 'birthday-luxe',
    category: 'Birthday',
    description: 'Celebration theme with confetti and vivid accents',
    previewImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    desktopBackground: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920',
    mobileBackground: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    primaryColor: '#FF6B9D',
    secondaryColor: '#FF8A00',
    accentColor: '#A78BFA',
    backgroundColor: '#0B0614',
    cardColor: '#1A1228',
    textColor: '#FFFFFF',
    fontHeading: 'Playfair Display',
    fontBody: 'Outfit',
    animationType: 'confetti',
    status: 'PUBLISHED',
    gradientColors: JSON.stringify(['#0B0614', '#FF6B9D', '#A78BFA']),
  },
  {
    name: 'Temple Divine',
    slug: 'temple-divine',
    category: 'Temple',
    description: 'Warm temple tones with soft light rays',
    previewImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    desktopBackground: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1920',
    primaryColor: '#FBBF24',
    secondaryColor: '#F59E0B',
    accentColor: '#FDE68A',
    backgroundColor: '#1A0E05',
    cardColor: '#2A1508',
    textColor: '#FFF7ED',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Outfit',
    animationType: 'light-rays',
    status: 'PUBLISHED',
  },
  {
    name: 'Corporate Clean',
    slug: 'corporate-clean',
    category: 'Corporate',
    description: 'Minimal dark corporate broadcast theme',
    previewImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    desktopBackground: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920',
    primaryColor: '#38BDF8',
    secondaryColor: '#0EA5E9',
    accentColor: '#F7B733',
    backgroundColor: '#080808',
    cardColor: '#121212',
    textColor: '#F8FAFC',
    fontHeading: 'Space Grotesk',
    fontBody: 'Outfit',
    animationType: 'none',
    status: 'PUBLISHED',
  },
]

async function main() {
  for (const t of themes) {
    const { assets, ...rest } = t as typeof t & { assets?: { create: unknown[] } }
    await prisma.eventTheme.upsert({
      where: { slug: t.slug },
      create: t as never,
      update: {
        ...rest,
        status: t.status,
      },
    })
  }
  console.log(`Seeded ${themes.length} event themes`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
