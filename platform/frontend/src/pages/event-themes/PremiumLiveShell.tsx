import { YouTubeEmbed } from '@/components/stream/YouTubeEmbed'
import { StreamPlayer } from '@/components/stream/StreamPlayer'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy,
  Eye,
  Gift,
  MessageCircle,
  Send,
  Share2,
  Smile,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { getPremiumTheme, type PremiumThemeDef } from './premiumThemes'
import './premium-live.css'

export type PremiumChatMsg = {
  id: string
  sender: string
  message: string
  emoji?: string | null
  createdAt?: string
  isAnnouncement?: boolean
}

export type PremiumLiveShellProps = {
  title: string
  eventType?: string
  designId?: string | null
  theme?: PremiumThemeDef | null
  viewers?: number
  peakViewers?: number
  isLive?: boolean
  lifecycle?: string
  countdownMs?: number | null
  liveTimings?: string | null
  scrollMessage?: string | null
  description?: string | null
  youtubeLiveUrl?: string | null
  hlsUrl?: string | null
  useYouTube?: boolean
  watermark?: string
  streamId?: string
  messages?: PremiumChatMsg[]
  onSendMessage?: (text: string) => void
  onShare?: () => void
  shareUrl?: string
  whatsappNumber?: string | null
  chatError?: string
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (d > 0) return { label: `${d}d ${h}h`, parts: [d, h, m, s] as const }
  return {
    label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
    parts: [0, h, m, s] as const,
  }
}

function Particles({ kind }: { kind: PremiumThemeDef['particle'] }) {
  const items = useMemo(() => Array.from({ length: 18 }, (_, i) => i), [])
  if (kind === 'none') return null
  return (
    <div className={`plx-particles plx-particles--${kind}`} aria-hidden>
      {items.map((i) => (
        <span key={i} className="plx-particle" style={{ ['--i' as string]: i }} />
      ))}
    </div>
  )
}

/** Ultra-premium cinematic live shell — theme driven by event category */
export function PremiumLiveShell({
  title,
  eventType,
  designId,
  theme: themeProp,
  viewers = 0,
  peakViewers = 0,
  isLive = true,
  lifecycle = 'LIVE',
  countdownMs,
  liveTimings,
  scrollMessage,
  description,
  youtubeLiveUrl,
  hlsUrl,
  useYouTube,
  watermark,
  streamId,
  messages = [],
  onSendMessage,
  onShare,
  shareUrl,
  whatsappNumber,
  chatError,
}: PremiumLiveShellProps) {
  const theme = themeProp || getPremiumTheme(designId, eventType)
  const [draft, setDraft] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [floats, setFloats] = useState<{ id: number; emoji: string }[]>([])
  const [giftPulse, setGiftPulse] = useState<string | null>(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 1400)
    return () => window.clearTimeout(t)
  }, [theme.id])

  const cd = countdownMs != null && countdownMs > 0 ? formatCountdown(countdownMs) : null
  const youtube = useYouTube ?? Boolean(youtubeLiveUrl)

  const spawnReaction = (emoji: string) => {
    const id = Date.now() + Math.random()
    setFloats((f) => [...f.slice(-12), { id, emoji }])
    window.setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 2200)
  }

  const send = (e: FormEvent, emoji?: string) => {
    e.preventDefault()
    const text = emoji || draft.trim()
    if (!text || !onSendMessage) return
    onSendMessage(text)
    setDraft('')
    setShowEmoji(false)
    if (emoji) spawnReaction(emoji)
  }

  const sendGift = (giftId: string, icon: string) => {
    setGiftPulse(giftId)
    spawnReaction(icon)
    onSendMessage?.(`🎁 ${icon}`)
    window.setTimeout(() => setGiftPulse(null), 600)
  }

  return (
    <div
      className={`plx plx--${theme.mood} plx-font-${theme.headingFont}`}
      style={
        {
          '--plx-accent': theme.accent,
          '--plx-accent2': theme.accent2,
          '--plx-glow': theme.glow,
          '--plx-bg': theme.bg,
          '--plx-surface': theme.surface,
          '--plx-text': theme.text,
          '--plx-muted': theme.muted,
          '--plx-border': theme.border,
          '--plx-hero': theme.heroOverlay,
        } as CSSProperties
      }
    >
      <AnimatePresence>
        {booting ? (
          <motion.div
            className="plx-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="plx-loader-ring" />
            <p>{theme.emoji} {theme.category}</p>
            <span>Preparing cinematic stream…</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="plx-hero-bg" />
      <Particles kind={theme.particle} />
      <div className="plx-vignette" />

      {/* Top bar */}
      <header className="plx-top">
        <div className="plx-top-left">
          <span className={`plx-live ${isLive ? 'is-on' : ''}`}>
            <i /> {lifecycle.replace('_', ' ')}
          </span>
          <span className="plx-cat">
            {theme.emoji} {theme.category}
          </span>
          <h1 className="plx-title">{title}</h1>
        </div>
        <div className="plx-top-right">
          <span className="plx-stat">
            <Users className="h-4 w-4" /> {viewers.toLocaleString()}
          </span>
          <span className="plx-stat plx-stat--muted">
            <Eye className="h-4 w-4" /> Peak {peakViewers.toLocaleString()}
          </span>
          {onShare || shareUrl ? (
            <button
              type="button"
              className="plx-btn plx-btn--ghost"
              onClick={() => {
                onShare?.()
                if (!onShare && shareUrl) void navigator.clipboard.writeText(shareUrl)
              }}
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          ) : null}
        </div>
      </header>

      {scrollMessage ? (
        <div className="plx-ticker">
          <span>{scrollMessage}</span>
          <span aria-hidden>{scrollMessage}</span>
        </div>
      ) : null}

      <main className="plx-main">
        <section className="plx-stage">
          {cd ? (
            <div className="plx-countdown">
              <p className="plx-countdown-label">Starts in</p>
              <div className="plx-countdown-grid">
                {[
                  { v: cd.parts[0], l: 'Days' },
                  { v: cd.parts[1], l: 'Hrs' },
                  { v: cd.parts[2], l: 'Min' },
                  { v: cd.parts[3], l: 'Sec' },
                ].map((u) => (
                  <div key={u.l} className="plx-cd-cell">
                    <strong>{String(u.v).padStart(2, '0')}</strong>
                    <span>{u.l}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="plx-player-frame">
            <div className="plx-player-glow" />
            <div className="plx-player-inner">
              {youtube && youtubeLiveUrl ? (
                <YouTubeEmbed url={youtubeLiveUrl} title={title} className="plx-yt" />
              ) : hlsUrl && streamId ? (
                <StreamPlayer
                  src={hlsUrl}
                  streamId={streamId}
                  isLive={isLive}
                  watermark={watermark || 'Guest'}
                />
              ) : (
                <div className="plx-player-empty">
                  <p>Live stream will appear here</p>
                  {liveTimings ? <span>{liveTimings}</span> : null}
                </div>
              )}
            </div>
            <div className="plx-corner plx-corner--tl" />
            <div className="plx-corner plx-corner--tr" />
            <div className="plx-corner plx-corner--bl" />
            <div className="plx-corner plx-corner--br" />
          </div>

          <div className="plx-info glass">
            <div>
              <p className="plx-info-label">Event</p>
              <p className="plx-info-value">{theme.category}</p>
            </div>
            {liveTimings ? (
              <div>
                <p className="plx-info-label">Schedule</p>
                <p className="plx-info-value">{liveTimings}</p>
              </div>
            ) : null}
            <div>
              <p className="plx-info-label">Status</p>
              <p className="plx-info-value">{lifecycle.replace('_', ' ')}</p>
            </div>
          </div>

          {(description || theme.footerLine) ? (
            <p className="plx-desc">{description || theme.footerLine}</p>
          ) : null}

          <div className="plx-reactions">
            {theme.reactions.map((em) => (
              <button key={em} type="button" className="plx-react" onClick={() => spawnReaction(em)}>
                {em}
              </button>
            ))}
          </div>
        </section>

        <aside className="plx-side">
          <div className="plx-chat glass">
            <div className="plx-chat-head">
              <MessageCircle className="h-4 w-4" />
              <span>Live Chat</span>
            </div>
            <div className="plx-chat-body">
              {messages.length === 0 ? (
                <p className="plx-chat-empty">Be the first to say something beautiful…</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`plx-bubble ${m.isAnnouncement ? 'is-announcement' : ''}`}
                  >
                    <span className="plx-bubble-name">
                      {m.isAnnouncement ? 'Announcement' : m.sender}
                    </span>
                    <p>
                      {m.emoji ? `${m.emoji} ` : ''}
                      {m.message}
                    </p>
                  </div>
                ))
              )}
            </div>
            {chatError ? <p className="plx-chat-error">{chatError}</p> : null}
            <form className="plx-chat-form" onSubmit={(e) => send(e)}>
              <div className="plx-chat-input-wrap">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Say something…"
                  className="plx-input"
                />
                {showEmoji ? (
                  <div className="plx-emoji-pop">
                    {theme.reactions.map((em) => (
                      <button key={em} type="button" onClick={(e) => send(e, em)}>
                        {em}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="plx-icon-btn"
                onClick={() => setShowEmoji((s) => !s)}
                aria-label="Emoji"
              >
                <Smile className="h-4 w-4" />
              </button>
              <button type="submit" className="plx-btn plx-btn--primary" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="plx-gifts glass">
            <div className="plx-chat-head">
              <Gift className="h-4 w-4" />
              <span>Virtual Gifts</span>
            </div>
            <div className="plx-gift-grid">
              {theme.gifts.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`plx-gift ${giftPulse === g.id ? 'is-pulse' : ''}`}
                  onClick={() => sendGift(g.id, g.icon)}
                >
                  <span className="plx-gift-icon">{g.icon}</span>
                  <span className="plx-gift-label">{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="plx-share-row">
            {shareUrl ? (
              <button
                type="button"
                className="plx-btn plx-btn--ghost"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              >
                <Copy className="h-4 w-4" /> Copy link
              </button>
            ) : null}
            {whatsappNumber ? (
              <a
                href={`https://wa.me/91${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="plx-btn plx-btn--ghost"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        </aside>
      </main>

      <footer className="plx-footer">
        <p>{theme.footerLine}</p>
        <span>SV Live Events</span>
      </footer>

      <div className="plx-float-layer" aria-hidden>
        {floats.map((f) => (
          <span key={f.id} className="plx-float">
            {f.emoji}
          </span>
        ))}
      </div>
    </div>
  )
}

export default PremiumLiveShell
