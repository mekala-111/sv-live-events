import { Bell, Eye, Menu, Save, Search, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  title?: string
  userName?: string
  userRole?: string
  onMenuClick?: () => void
  onPreview?: () => void
  onSaveDraft?: () => void
  onPublish?: () => void
  saving?: boolean
  className?: string
  compact?: boolean
}

export function AdminHeader({
  title = 'Welcome to Event Administration Portal',
  userName = 'Admin User',
  userRole = 'Super Admin',
  onMenuClick,
  onPreview,
  onSaveDraft,
  onPublish,
  saving,
  className,
  compact,
}: AdminHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl',
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-white/10 p-2 text-orange lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-sm font-semibold text-white sm:text-base lg:text-lg">
            {title}
          </h1>
        </div>

        <div className={cn('order-last flex w-full items-center gap-2 sm:order-none sm:w-auto', compact && 'w-auto')}>
          {!compact && (
            <>
          <div className="relative min-w-0 flex-1 sm:w-52 lg:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gold/70" />
            <input
              type="search"
              placeholder="Search events…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pr-3 pl-9 text-sm text-white placeholder:text-white/30 focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/15"
            />
          </div>

          <button
            type="button"
            className="relative rounded-xl border border-white/10 p-2.5 text-white/60 transition hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              10
            </span>
          </button>
            </>
          )}

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold to-orange text-xs font-bold text-[#080808]">
              {userName.slice(0, 1)}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-medium text-white">{userName}</p>
              <p className="text-[10px] text-white/40">{userRole}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onPreview} className="hidden md:inline-flex">
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onSaveDraft} disabled={saving}>
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>
          <Button type="button" variant="gold" size="sm" onClick={onPublish} disabled={saving} className="shadow-[var(--glow-gold)]">
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Publish Event</span>
            <span className="sm:hidden">Publish</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
