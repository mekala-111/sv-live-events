import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import { QRCodeSVG } from 'qrcode.react'
import {
  Copy, Eye, Heart, Lock, MessageCircle, Send, Share2, Smile, ThumbsUp, Users,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StreamPlayer } from '@/components/stream/StreamPlayer'
import { YouTubeEmbed } from '@/components/stream/YouTubeEmbed'
import { EngagePanel } from '@/components/stream/EngagePanel'
import { CreamTheme } from '@/pages/event-themes/Theme1'
import { isCreamTheme } from '@/pages/event-themes/creamThemes'
import { DynamicThemeShell } from '@/features/theme/DynamicThemeShell'
import { toWhatsAppHref } from '@/lib/whatsapp'

interface StreamInfo {
  id: string
  title: string
  slug: string
  status: string
  lifecycle?: string
  countdownMs?: number | null
  isLive: boolean
  currentViewers: number
  peakViewers: number
  hlsUrl: string
  pinnedMessage?: string | null
  eventType: string
  slowModeSec?: number
  allowGifs?: boolean
  scheduledAt?: string | null
  service?: string
  youtubeLiveUrl?: string | null
  teaserUrl?: string | null
  liveTimings?: string | null
  scrollMessage?: string | null
  watchLiveButton?: boolean
  socialShare?: boolean
  whatsappNumber?: string | null
  designId?: string | null
  designName?: string | null
  fontColor?: string | null
}

interface ChatMsg {
  id: string
  sender: string
  message: string
  emoji?: string | null
  gifUrl?: string | null
  createdAt: string
  isPinned?: boolean
  isAnnouncement?: boolean
}

interface StatusPayload {
  lifecycle: string
  countdownMs: number | null
  title: string
  eventType: string
  currentViewers: number
  service?: string
  youtubeLiveUrl?: string | null
  liveTimings?: string | null
  designId?: string | null
  screens: {
    waiting: boolean
    startingSoon: boolean
    live: boolean
    paused: boolean
    offline: boolean
    ended: boolean
  }
}

const EMOJIS = ['👏', '❤️', '🔥', '🎉', '🙏', '😍', '✨', '💐']

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function detectOs() {
  const ua = navigator.userAgent
  if (/Mac/.test(ua)) return 'macOS'
  if (/Win/.test(ua)) return 'Windows'
  if (/Android/.test(ua)) return 'Android'
  if (/iPhone|iPad/.test(ua)) return 'iOS'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Other'
}

export default function LiveEventPage() {
  const { streamKey: slugParam } = useParams()
  const slug = slugParam || ''
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('Guest')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [playbackToken, setPlaybackToken] = useState('')
  const [watermark, setWatermark] = useState('')
  const [stream, setStream] = useState<StreamInfo | null>(null)
  const [preStatus, setPreStatus] = useState<StatusPayload | null>(null)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [viewers, setViewers] = useState(0)
  const [reactions, setReactions] = useState({ hearts: 48, likes: 22 })
  const [showShare, setShowShare] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [countdownMs, setCountdownMs] = useState<number | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const typingTimer = useRef<number | null>(null)

  const shareUrl = useMemo(() => `${window.location.origin}/live/${slug}`, [slug])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    const poll = async () => {
      try {
        const res = await api.get(`/stream/status/${slug}`)
        if (cancelled) return
        const data = res.data?.data as StatusPayload
        setPreStatus(data)
        setCountdownMs(data.countdownMs)
        setViewers(data.currentViewers || 0)
      } catch {
        /* stream may not exist yet */
      }
    }
    poll()
    const id = window.setInterval(poll, 10000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [slug])

  useEffect(() => {
    if (countdownMs == null || countdownMs <= 0) return
    const id = window.setInterval(() => {
      setCountdownMs((c) => (c == null ? null : Math.max(0, c - 1000)))
    }, 1000)
    return () => window.clearInterval(id)
  }, [countdownMs != null && countdownMs > 0])

  useEffect(() => {
    if (!playbackToken || !stream) return

    let socket: Socket | null = null
    try {
      socket = io('/', { path: '/socket.io', transports: ['websocket', 'polling'] })
      socketRef.current = socket
      socket.emit('join-stream', stream.id)
      socket.on('stream-chat', (msg: ChatMsg) => {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      })
      socket.on('viewer-count', (count: number) => setViewers(count))
      socket.on('stream-typing', (payload: { sender: string; typing: boolean }) => {
        setTypingUsers((prev) => {
          if (payload.typing) {
            return prev.includes(payload.sender) ? prev : [...prev, payload.sender]
          }
          return prev.filter((n) => n !== payload.sender)
        })
      })
      socket.on('stream-lifecycle', (payload: { lifecycle: string; status: string }) => {
        setStream((s) =>
          s
            ? {
                ...s,
                lifecycle: payload.lifecycle,
                status: payload.status,
                isLive: payload.lifecycle === 'LIVE',
              }
            : s,
        )
      })
    } catch {
      /* optional */
    }

    const interval = window.setInterval(async () => {
      try {
        const [countRes, statusRes] = await Promise.all([
          api.get(`/stream/viewer/count/${slug}`),
          api.get(`/stream/status/${slug}`),
        ])
        setViewers(countRes.data?.data?.currentViewers ?? viewers)
        const st = statusRes.data?.data
        if (st) {
          setCountdownMs(st.countdownMs)
          setStream((s) =>
            s
              ? {
                  ...s,
                  lifecycle: st.lifecycle,
                  status: st.status,
                  isLive: st.lifecycle === 'LIVE',
                  pinnedMessage: st.pinnedMessage ?? s.pinnedMessage,
                }
              : s,
          )
        }
      } catch {
        /* ignore */
      }
    }, 8000)

    return () => {
      window.clearInterval(interval)
      api.post('/stream/viewer/leave', { playbackToken }).catch(() => undefined)
      socket?.emit('leave-stream', stream.id)
      socket?.disconnect()
      socketRef.current = null
    }
  }, [playbackToken, stream?.id, slug])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const conn = (navigator as Navigator & { connection?: { downlink?: number } }).connection
      const res = await api.post(`/stream/verify-password/${slug}`, {
        password,
        displayName: displayName || 'Guest',
        device: /Mobi/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        browser: navigator.userAgent.includes('Chrome')
          ? 'Chrome'
          : navigator.userAgent.includes('Safari')
            ? 'Safari'
            : 'Other',
        os: detectOs(),
        networkSpeed: conn?.downlink ? `${conn.downlink} Mbps` : undefined,
        country: 'IN',
      })
      const payload = res.data?.data
      setPlaybackToken(payload.playbackToken)
      setWatermark(payload.watermark || displayName)
      setStream(payload.stream)
      setViewers(payload.stream.currentViewers)
      setCountdownMs(payload.stream.countdownMs ?? null)
      const chat = await api.get(`/stream/chat/${slug}`)
      setMessages(chat.data?.data || [])
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid password or stream unavailable'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const emitTyping = useCallback(
    (typing: boolean) => {
      socketRef.current?.emit('stream-typing', {
        streamId: stream?.id,
        sender: displayName || 'Guest',
        typing,
      })
    },
    [stream?.id, displayName],
  )

  const onMessageChange = (value: string) => {
    setNewMessage(value)
    emitTyping(true)
    if (typingTimer.current) window.clearTimeout(typingTimer.current)
    typingTimer.current = window.setTimeout(() => emitTyping(false), 1200)
  }

  const sendMessage = async (e: React.FormEvent, emoji?: string) => {
    e.preventDefault()
    const text = emoji || newMessage.trim()
    if (!text || !playbackToken) return
    try {
      const res = await api.post(`/stream/chat/${slug}`, {
        sender: displayName || 'Guest',
        message: text,
        emoji: emoji ? emoji : undefined,
        playbackToken,
      })
      setMessages((m) => [...m, res.data.data])
      setNewMessage('')
      setShowEmoji(false)
      emitTyping(false)
      socketRef.current?.emit('stream-chat-broadcast', res.data.data)
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Unable to send message'
      setError(msg)
    }
  }

  const lifecycle = stream?.lifecycle || preStatus?.lifecycle || stream?.status || 'WAITING'
  const screens = preStatus?.screens
  const isYouTube =
    stream?.service === 'youtube' ||
    Boolean(stream?.youtubeLiveUrl) ||
    preStatus?.service === 'youtube' ||
    Boolean(preStatus?.youtubeLiveUrl)

  if (!stream) {
    const showGate =
      !screens?.ended &&
      !screens?.waiting &&
      !screens?.startingSoon &&
      lifecycle !== 'ENDED'

    // Still show password gate, but with status banner
    return (
      <>
        <Helmet>
          <title>{isYouTube ? 'Watch Live' : 'Private Stream'} | SV Live Events</title>
          <meta property="og:title" content={isYouTube ? 'Event Live Stream | SV Live Events' : 'Private Live Stream | SV Live Events'} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(201,161,74,0.18),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(201,161,74,0.1),transparent_40%)]" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass relative w-full max-w-md rounded-3xl p-8">
            {screens?.ended || lifecycle === 'ENDED' ? (
              <EndedScreen title={preStatus?.title} />
            ) : !isYouTube && (screens?.startingSoon || lifecycle === 'STARTING_SOON') ? (
              <StartingSoonScreen title={preStatus?.title} countdownMs={countdownMs} />
            ) : !isYouTube && (screens?.waiting || lifecycle === 'WAITING' || lifecycle === 'SCHEDULED') ? (
              <>
                <WaitingScreen title={preStatus?.title} countdownMs={countdownMs} />
                <form onSubmit={handleAuth} className="mt-6 space-y-4">
                  <Input label="Your Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  <Input
                    label="Stream Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={error}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Verifying…' : 'Unlock Lobby'}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-gold-light">
                  <Lock className="h-8 w-8" />
                </div>
                <h1 className="mt-6 text-center font-display text-2xl font-bold">
                  {isYouTube ? 'Watch the Event Live' : 'Private Live Stream'}
                </h1>
                <p className="mt-2 text-center text-sm text-white/50">
                  {isYouTube
                    ? 'Enter the PIN shared by the host to open the YouTube Live event page.'
                    : 'Enter the password shared by SV Live Events to unlock HLS playback.'}
                </p>
                {preStatus?.liveTimings ? (
                  <p className="mt-3 text-center text-xs text-gold-light/80">{preStatus.liveTimings}</p>
                ) : null}
                {showGate ? null : null}
                <form onSubmit={handleAuth} className="mt-8 space-y-4">
                  <Input label="Your Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  <Input
                    label={isYouTube ? 'Event PIN' : 'Stream Password'}
                    type="password"
                    placeholder={isYouTube ? 'Enter PIN' : 'Enter password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={error}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Verifying…' : isYouTube ? 'Watch Live' : 'Join Stream'}
                  </Button>
                </form>
              </>
            )}
            {!isYouTube ? (
              <p className="mt-4 text-center text-xs text-white/35">
                Demo: <span className="text-gold-light">/live/rahul-priya-wedding</span> · password{' '}
                <span className="text-gold-light">Wedding@2027</span>
              </p>
            ) : null}
          </motion.div>
        </div>
      </>
    )
  }

  const youtubeMode = stream.service === 'youtube' || Boolean(stream.youtubeLiveUrl)
  const showPlayer = youtubeMode || lifecycle === 'LIVE' || stream.isLive
  const showPaused = !youtubeMode && lifecycle === 'PAUSED'
  const showOffline = !youtubeMode && lifecycle === 'OFFLINE'
  const showEnded = lifecycle === 'ENDED' || lifecycle === 'ARCHIVED'
  const showSoon = !youtubeMode && (lifecycle === 'STARTING_SOON' || lifecycle === 'WAITING' || lifecycle === 'SCHEDULED')
  const useCream = isCreamTheme(stream.designId)
  const useDynamicTheme = Boolean(stream.designId) && !useCream

  if (useDynamicTheme && !showEnded) {
    return (
      <>
        <Helmet>
          <title>{stream.title} | Live</title>
          <meta property="og:title" content={stream.title} />
          <meta
            property="og:description"
            content={stream.liveTimings || `${stream.eventType} — Live on SV Live Events`}
          />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
        <DynamicThemeShell
          title={stream.title}
          eventType={stream.eventType}
          designId={stream.designId}
          themeSlug={stream.designId}
          viewers={viewers}
          peakViewers={stream.peakViewers}
          isLive={showPlayer}
          lifecycle={lifecycle}
          countdownMs={countdownMs}
          liveTimings={stream.liveTimings}
          scrollMessage={stream.scrollMessage}
          description={stream.pinnedMessage}
          youtubeLiveUrl={stream.youtubeLiveUrl}
          hlsUrl={stream.hlsUrl}
          useYouTube={youtubeMode}
          watermark={watermark || displayName}
          streamId={stream.id}
          messages={messages}
          chatError={error}
          shareUrl={shareUrl}
          whatsappNumber={stream.whatsappNumber}
          onShare={() => {
            if (navigator.share) {
              void navigator.share({ title: stream.title, url: shareUrl }).catch(() => undefined)
            } else {
              void navigator.clipboard.writeText(shareUrl)
            }
          }}
          onSendMessage={(text) => {
            void (async () => {
              try {
                const res = await api.post(`/stream/chat/${slug}`, {
                  sender: displayName || 'Guest',
                  message: text,
                  playbackToken,
                })
                setMessages((m) => [...m, res.data.data])
                socketRef.current?.emit('stream-chat-broadcast', res.data.data)
              } catch (err) {
                const msg =
                  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                  'Unable to send message'
                setError(msg)
              }
            })()
          }}
        />
      </>
    )
  }

  if (useCream && !showEnded) {
    return (
      <>
        <Helmet>
          <title>{stream.title}</title>
          <meta property="og:title" content={stream.title} />
          <meta
            property="og:description"
            content={stream.liveTimings || `${stream.eventType} — Live on SV Live Events`}
          />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
        <CreamTheme
          title={stream.title}
          designId={stream.designId}
          liveTimings={stream.liveTimings}
          scrollMessage={stream.scrollMessage}
          youtubeLiveUrl={stream.youtubeLiveUrl}
          teaserUrl={stream.teaserUrl}
          watchLiveButton={stream.watchLiveButton !== false}
          socialShare={stream.socialShare !== false}
          whatsappNumber={stream.whatsappNumber}
          fontColor={stream.fontColor}
          shareUrl={shareUrl}
          onShare={() => {
            if (navigator.share) {
              void navigator.share({ title: stream.title, url: shareUrl }).catch(() => undefined)
            } else {
              void navigator.clipboard.writeText(shareUrl)
            }
          }}
        />
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>{stream.title} | Live</title>
        <meta property="og:title" content={stream.title} />
        <meta property="og:description" content={`${stream.eventType} private live stream — SV Live Events`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BroadcastEvent',
            name: stream.title,
            isLiveBroadcast: showPlayer,
            eventStatus: showEnded ? 'https://schema.org/EventCompleted' : 'https://schema.org/EventScheduled',
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-[#050505]">
        <div className="border-b border-white/5 bg-[#090909]/95 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-2 w-2 rounded-full ${
                    showPlayer ? 'animate-pulse bg-red-500' : showEnded ? 'bg-white/30' : 'bg-amber-400'
                  }`}
                />
                <span className="text-xs font-medium uppercase text-red-400">
                  {lifecycle.replace('_', ' ')}
                </span>
                <span className="text-xs text-white/40">· {stream.eventType}</span>
              </div>
              <h1 className="font-display text-xl font-semibold md:text-2xl">{stream.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold-light" />
                {viewers.toLocaleString()} watching
              </span>
              <span className="hidden items-center gap-2 sm:flex">
                <Eye className="h-4 w-4" />
                Peak {stream.peakViewers}
              </span>
              <Button variant="ghost" className="!px-3" onClick={() => setShowShare((s) => !s)}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 p-4 md:p-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {showEnded ? (
              <StatePanel>
                <EndedScreen title={stream.title} />
              </StatePanel>
            ) : showSoon ? (
              <StatePanel>
                <StartingSoonScreen title={stream.title} countdownMs={countdownMs} />
              </StatePanel>
            ) : showPaused ? (
              <StatePanel>
                <p className="font-display text-2xl">Stream Paused</p>
                <p className="mt-2 text-sm text-white/50">The host paused the broadcast. Hang tight.</p>
              </StatePanel>
            ) : showOffline ? (
              <StatePanel>
                <p className="font-display text-2xl">Temporarily Offline</p>
                <p className="mt-2 text-sm text-white/50">Publisher disconnected. Reconnecting automatically…</p>
              </StatePanel>
            ) : youtubeMode && stream.youtubeLiveUrl ? (
              <div className="space-y-3">
                {stream.watchLiveButton !== false ? (
                  <YouTubeEmbed url={stream.youtubeLiveUrl} title={stream.title} />
                ) : (
                  <StatePanel>
                    <p className="font-display text-2xl">Live stream ready</p>
                    <a
                      href={stream.youtubeLiveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-[#090909]"
                    >
                      Open YouTube Live
                    </a>
                  </StatePanel>
                )}
                {stream.liveTimings ? (
                  <p className="text-center text-sm text-white/50">{stream.liveTimings}</p>
                ) : null}
                {stream.scrollMessage ? (
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gold-light">
                    <p className="animate-pulse truncate">{stream.scrollMessage}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <StreamPlayer
                src={stream.hlsUrl}
                streamId={stream.id}
                isLive={showPlayer}
                watermark={watermark || displayName}
              />
            )}

            {stream.pinnedMessage ? (
              <div className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-light">
                📌 {stream.pinnedMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" onClick={() => setReactions((r) => ({ ...r, hearts: r.hearts + 1 }))}>
                <Heart className="h-4 w-4 text-red-400" /> {reactions.hearts}
              </Button>
              <Button variant="ghost" onClick={() => setReactions((r) => ({ ...r, likes: r.likes + 1 }))}>
                <ThumbsUp className="h-4 w-4 text-gold-light" /> {reactions.likes}
              </Button>
              <Button variant="ghost" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                <Copy className="h-4 w-4" /> Copy link
              </Button>
              {youtubeMode && stream.youtubeLiveUrl && stream.socialShare !== false ? (
                <a
                  href={stream.youtubeLiveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  <Share2 className="h-4 w-4 text-gold-light" /> YouTube
                </a>
              ) : null}
              {stream.whatsappNumber ? (
                <a
                  href={toWhatsAppHref(stream.whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  WhatsApp Support
                </a>
              ) : null}
            </div>

            {showShare ? (
              <div className="glass flex flex-col items-center gap-3 rounded-2xl p-6 sm:flex-row">
                <QRCodeSVG value={shareUrl} size={120} bgColor="#090909" fgColor="#F7E6A3" />
                <div>
                  <p className="font-medium text-gold-light">Scan to join</p>
                  <p className="mt-1 break-all text-sm text-white/60">{shareUrl}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
          <div className="glass flex h-[520px] flex-col rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3 text-sm font-medium">
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gold-light" /> Live Chat
              </span>
              {stream.slowModeSec ? (
                <span className="text-[10px] uppercase tracking-wider text-white/40">
                  Slow {stream.slowModeSec}s
                </span>
              ) : null}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl px-3 py-2 ${
                    m.isAnnouncement ? 'border border-gold/40 bg-gold/10' : 'bg-white/5'
                  }`}
                >
                  <p className="text-xs text-gold-light">
                    {m.isAnnouncement ? 'Announcement' : m.sender}
                  </p>
                  {m.gifUrl ? (
                    <img src={m.gifUrl} alt="" className="mt-1 max-h-28 rounded-lg" loading="lazy" />
                  ) : (
                    <p className="text-sm text-white/85">
                      {m.emoji ? `${m.emoji} ` : ''}
                      {m.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {typingUsers.length > 0 ? (
              <p className="py-1 text-[11px] text-white/40">
                {typingUsers.slice(0, 2).join(', ')} typing…
              </p>
            ) : null}
            {error ? <p className="text-xs text-red-300">{error}</p> : null}
            <form onSubmit={(e) => sendMessage(e)} className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Say something beautiful…"
                  value={newMessage}
                  onChange={(e) => onMessageChange(e.target.value)}
                />
                {showEmoji ? (
                  <div className="absolute bottom-full left-0 mb-2 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[#111] p-2 shadow-xl">
                    {EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        className="rounded-lg px-2 py-1 text-lg hover:bg-white/10"
                        onClick={(e) => sendMessage(e, em)}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <Button type="button" variant="ghost" className="!px-3" onClick={() => setShowEmoji((s) => !s)}>
                <Smile className="h-4 w-4" />
              </Button>
              <Button type="submit" className="!px-3">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <EngagePanel slug={slug} sender={displayName || 'Guest'} playbackToken={playbackToken} />
          </div>
        </div>
      </div>
    </>
  )
}

function StatePanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#121212] to-[#050505] p-10 text-center md:min-h-[420px]">
      {children}
    </div>
  )
}

function WaitingScreen({ title, countdownMs }: { title?: string; countdownMs?: number | null }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-light">Waiting</p>
      <h1 className="mt-3 font-display text-2xl font-bold">{title || 'Private Event'}</h1>
      <p className="mt-2 text-sm text-white/50">The stream has not started yet.</p>
      {countdownMs != null && countdownMs > 0 ? (
        <p className="mt-6 font-mono text-3xl text-gold-light">{formatCountdown(countdownMs)}</p>
      ) : null}
    </div>
  )
}

function StartingSoonScreen({ title, countdownMs }: { title?: string; countdownMs?: number | null }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Starting Soon</p>
      <h1 className="mt-3 font-display text-2xl font-bold">{title || 'Private Event'}</h1>
      <p className="mt-2 text-sm text-white/50">Please stay on this page — we go live shortly.</p>
      {countdownMs != null && countdownMs > 0 ? (
        <p className="mt-6 font-mono text-4xl text-amber-200">{formatCountdown(countdownMs)}</p>
      ) : (
        <p className="mt-6 animate-pulse text-lg text-gold-light">Any moment now…</p>
      )}
    </div>
  )
}

function EndedScreen({ title }: { title?: string }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-white/40">Event Ended</p>
      <h1 className="mt-3 font-display text-2xl font-bold">{title || 'Private Event'}</h1>
      <p className="mt-2 text-sm text-white/50">
        Thank you for watching. The recording will be available from your dashboard soon.
      </p>
    </div>
  )
}
