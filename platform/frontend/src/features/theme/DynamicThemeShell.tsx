import { useQuery } from '@tanstack/react-query'
import { getPublishedTheme, listPublishedThemes } from '@/services/themeService'
import type { EventThemeRecord } from '@/types/theme'
import { ThemePreview } from '@/features/theme-builder/ThemePreview'
import { defaultThemeForm } from '@/constants/themeBuilder'
import { PremiumLiveShell, type PremiumLiveShellProps } from '@/pages/event-themes/PremiumLiveShell'
import { getPremiumTheme, isPremiumTheme } from '@/pages/event-themes/premiumThemes'

type Props = PremiumLiveShellProps & {
  themeSlug?: string | null
}

function toForm(t: EventThemeRecord) {
  return {
    ...defaultThemeForm(),
    ...t,
    layers: t.layers || defaultThemeForm().layers,
    gradientColors: Array.isArray(t.gradientColors)
      ? t.gradientColors
      : defaultThemeForm().gradientColors,
    customFonts: t.customFonts || [],
    assets: t.assets || [],
  }
}

/** Streaming shell — prefers DB theme by slug/id, falls back to legacy premium themes */
export function DynamicThemeShell({ themeSlug, designId, ...props }: Props) {
  const key = themeSlug || designId || null

  const dbQuery = useQuery({
    queryKey: ['published-theme', key],
    queryFn: () => getPublishedTheme(key!),
    enabled: !!key && !String(key).startsWith('premium-') && !String(key).startsWith('cream-'),
    staleTime: 60_000,
    retry: 1,
  })

  if (dbQuery.data) {
    const theme = toForm(dbQuery.data)
    return (
      <div className="relative min-h-screen overflow-hidden" style={{ background: theme.backgroundColor, color: theme.textColor }}>
        {theme.musicUrl && <audio src={theme.musicUrl} autoPlay loop preload="auto" className="hidden" />}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <ThemePreview theme={theme} device="desktop" title={props.title} className="!items-stretch h-full [&_>div:first-child]:h-full [&_>div:first-child]:max-h-none [&_>div:first-child]:w-full [&_>div:first-child]:rounded-none [&_>div:first-child]:border-0" />
        </div>
        <div className="relative z-10">
          <PremiumLiveShell
            {...props}
            designId={key}
            theme={{
              id: dbQuery.data.slug,
              mood: 'wedding',
              name: dbQuery.data.name,
              category: dbQuery.data.category,
              emoji: '✨',
              from: dbQuery.data.backgroundColor,
              to: dbQuery.data.primaryColor,
              accent: dbQuery.data.primaryColor,
              accent2: dbQuery.data.secondaryColor,
              glow: dbQuery.data.glowColor,
              bg: dbQuery.data.backgroundColor,
              surface: dbQuery.data.cardColor,
              text: dbQuery.data.textColor,
              muted: 'rgba(255,255,255,0.55)',
              border: dbQuery.data.borderColor,
              headingFont: 'space',
              bodyFont: 'outfit',
              particle: (['petals', 'confetti', 'stars', 'sparks', 'dots', 'orbs', 'none'].includes(dbQuery.data.animationType)
                ? dbQuery.data.animationType
                : 'dots') as 'petals' | 'confetti' | 'stars' | 'sparks' | 'dots' | 'orbs' | 'none',
              gifts: [],
              reactions: ['👏', '❤️', '✨'],
              footerLine: dbQuery.data.description || dbQuery.data.name,
              heroOverlay: `linear-gradient(180deg, ${dbQuery.data.backgroundColor} 0%, transparent 40%, ${dbQuery.data.backgroundColor} 100%)`,
            }}
            watermark={dbQuery.data.watermarkUrl || props.watermark}
          />
        </div>
      </div>
    )
  }

  if (isPremiumTheme(designId)) {
    return <PremiumLiveShell {...props} designId={designId} theme={getPremiumTheme(designId)} />
  }

  return <PremiumLiveShell {...props} designId={designId} />
}

export function usePublishedThemes(category?: string) {
  return useQuery({
    queryKey: ['published-themes', category],
    queryFn: () => listPublishedThemes(category),
    staleTime: 60_000,
  })
}
