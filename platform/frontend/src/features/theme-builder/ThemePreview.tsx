import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { PreviewDevice, ThemeFormValues } from '@/types/theme'
import { PREVIEW_DEVICES } from '@/constants/themeBuilder'
import { resolveBackground } from '@/services/themeService'
import { cn } from '@/lib/utils'

interface ThemePreviewProps {
  theme: ThemeFormValues
  device: PreviewDevice
  className?: string
  title?: string
}

function AnimLayer({
  type,
  opacity,
  density,
  speed,
}: {
  type: string
  opacity: number
  density: number
  speed: number
}) {
  const count = Math.max(6, Math.round(14 * density))
  const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count])
  if (type === 'none') return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity }} aria-hidden>
      {items.map((i) => (
        <motion.span
          key={i}
          className="absolute block rounded-full"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            width: type === 'confetti' || type === 'petals' ? 8 : 4,
            height: type === 'confetti' || type === 'petals' ? 12 : 4,
            background:
              type === 'petals'
                ? '#f9a8d4'
                : type === 'confetti'
                  ? ['#F7B733', '#FF8A00', '#38bdf8', '#a78bfa'][i % 4]
                  : type === 'fireflies' || type === 'sparkles' || type === 'stars'
                    ? '#F7B733'
                    : 'rgba(255,255,255,0.5)',
            boxShadow: type === 'fireflies' || type === 'sparkles' ? '0 0 8px #F7B733' : undefined,
          }}
          animate={{
            y: type === 'snow' || type === 'petals' || type === 'rain' ? [0, 120] : [0, -20, 0],
            x: type === 'clouds' || type === 'smoke' ? [0, 40] : [0, (i % 2 ? 10 : -10), 0],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: Math.max(1.2, 4 / speed) + (i % 5) * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.12,
          }}
        />
      ))}
    </div>
  )
}

export function ThemePreview({ theme, device, className, title = 'Live Preview' }: ThemePreviewProps) {
  const spec = PREVIEW_DEVICES.find((d) => d.id === device) ?? PREVIEW_DEVICES[0]
  const bg = resolveBackground(theme, device)
  const overlayLayer = theme.layers?.find((l) => l.type === 'overlay')
  const particlesLayer = theme.layers?.find((l) => l.type === 'particles')
  const frameLayer = theme.layers?.find((l) => l.type === 'frame')
  const grads = Array.isArray(theme.gradientColors) ? theme.gradientColors : []

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className="relative overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300"
        style={{
          width: Math.min(spec.width, 560),
          aspectRatio: `${spec.width} / ${spec.height}`,
          maxHeight: 420,
          borderColor: theme.borderColor,
          background: theme.backgroundColor,
          boxShadow: `0 0 40px ${theme.glowColor}`,
        }}
      >
        {/* Layer 1 — background */}
        {theme.layers?.find((l) => l.type === 'background')?.visible !== false && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: bg
                ? `url(${bg})`
                : `linear-gradient(135deg, ${grads[0] || theme.backgroundColor}, ${grads[1] || theme.primaryColor})`,
              opacity: theme.layers?.find((l) => l.type === 'background')?.opacity ?? 1,
              filter: `blur(${theme.layers?.find((l) => l.type === 'background')?.blur ?? 0}px)`,
              transform: `scale(${theme.layers?.find((l) => l.type === 'background')?.scale ?? 1})`,
            }}
          />
        )}

        {/* Layer 2 — overlay */}
        {overlayLayer?.visible && (
          <div
            className="absolute inset-0"
            style={{
              opacity: overlayLayer.opacity,
              mixBlendMode: overlayLayer.blendMode as React.CSSProperties['mixBlendMode'],
              background: `linear-gradient(180deg, ${theme.backgroundColor}cc, transparent 40%, ${theme.backgroundColor}ee)`,
            }}
          />
        )}

        {/* Animations / particles */}
        {particlesLayer?.visible !== false && (
          <AnimLayer
            type={theme.animationType}
            opacity={(particlesLayer?.opacity ?? 1) * theme.animationOpacity}
            density={theme.animationDensity}
            speed={theme.animationSpeed}
          />
        )}

        {/* Frame */}
        {frameLayer?.visible && theme.frameImage && (
          <img
            src={theme.frameImage}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            style={{ opacity: frameLayer.opacity }}
          />
        )}

        {/* Assets */}
        {theme.assets
          ?.filter((a) => a.visible !== false && a.assetPath && a.assetType !== 'music')
          .map((a, i) => (
            <img
              key={`${a.assetType}-${i}`}
              src={a.assetPath}
              alt={a.label || a.assetType}
              className="pointer-events-none absolute max-h-[30%] max-w-[30%] object-contain"
              style={{
                left: `${a.positionX ?? 4 + i * 8}%`,
                top: `${a.positionY ?? 70}%`,
                opacity: a.opacity ?? 1,
                mixBlendMode: (a.blendMode as React.CSSProperties['mixBlendMode']) || 'normal',
                transform: `scale(${a.scale ?? 1})`,
                filter: a.blur ? `blur(${a.blur}px)` : undefined,
              }}
              loading="lazy"
            />
          ))}

        {/* UI chrome */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between">
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase"
                style={{ background: theme.buttonColor, color: theme.backgroundColor }}
              >
                Live
              </span>
            )}
            {theme.watermarkUrl && (
              <img src={theme.watermarkUrl} alt="" className="h-6 opacity-60" />
            )}
          </div>

          <div
            className="rounded-xl border p-3 backdrop-blur-md"
            style={{
              background: theme.glassColor || theme.cardColor,
              borderColor: theme.borderColor,
              color: theme.textColor,
              fontFamily: theme.fontBody,
            }}
          >
            <p className="text-xs opacity-60">SV Live Events</p>
            <p className="mt-0.5 text-sm font-semibold" style={{ fontFamily: theme.fontHeading }}>
              {theme.name || title}
            </p>
            <div className="mt-2 flex gap-2">
              <span
                className="rounded-lg px-3 py-1.5 text-[11px] font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                  color: '#080808',
                  fontFamily: theme.fontButton || theme.fontBody,
                }}
              >
                Watch Live
              </span>
              <span
                className="rounded-lg border px-3 py-1.5 text-[11px]"
                style={{ borderColor: theme.borderColor, color: theme.textColor }}
              >
                Chat
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] tracking-wider text-white/35 uppercase">
        {spec.label} · {spec.width}×{spec.height}
      </p>
    </div>
  )
}
