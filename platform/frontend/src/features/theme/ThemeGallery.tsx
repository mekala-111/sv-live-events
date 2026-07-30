import { motion } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
import type { EventTheme } from '@/types/event'
import { cn } from '@/lib/utils'

interface ThemeGalleryProps {
  themes: EventTheme[]
  selectedId: string
  onSelect: (id: string) => void
}

export function ThemeGallery({ themes, selectedId, onSelect }: ThemeGalleryProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {themes.map((theme) => {
        const selected = theme.id === selectedId
        const isCustom = theme.id === 'custom'
        return (
          <motion.button
            key={theme.id}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(theme.id)}
            className={cn(
              'relative h-36 w-44 shrink-0 overflow-hidden rounded-2xl border text-left transition',
              selected
                ? 'border-gold shadow-[var(--glow-gold)]'
                : 'border-white/10 hover:border-white/25',
            )}
            style={{
              background: theme.preview ? undefined : theme.gradient,
              backgroundImage: theme.preview ? `url(${theme.preview})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {isCustom ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-white/60">
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Custom</span>
              </div>
            ) : (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-sm font-semibold text-white">{theme.name}</p>
              </div>
            )}
            {selected && (
              <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gold to-orange text-[#080808] shadow">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
