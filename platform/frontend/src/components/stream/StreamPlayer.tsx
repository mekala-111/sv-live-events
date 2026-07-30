import { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

const VOLUME_KEY = 'svlive-player-volume'
const RESUME_KEY = 'svlive-player-resume'

interface Props {
  src: string
  poster?: string
  autoplay?: boolean
  watermark?: string
  streamId?: string
  isLive?: boolean
}

type Stats = {
  bitrate: number
  buffered: number
  latency: number | null
  resolution: string
  dropped: number
}

export function StreamPlayer({
  src,
  poster,
  autoplay = true,
  watermark,
  streamId,
  isLive = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<Player | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const reconnectTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!videoRef.current) return

    const savedVol = Number(localStorage.getItem(VOLUME_KEY) ?? '0.7')
    const resumeMap = JSON.parse(localStorage.getItem(RESUME_KEY) || '{}') as Record<string, number>
    const resumeAt = streamId && !isLive ? resumeMap[streamId] : undefined

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay,
      muted: true,
      preload: 'auto',
      fluid: true,
      liveui: true,
      playbackRates: isLive ? [1] : [0.75, 1, 1.25, 1.5],
      sources: [{ src, type: src.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4' }],
      poster,
      controlBar: {
        pictureInPictureToggle: true,
        volumePanel: { inline: false },
      },
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          handlePartialData: true,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
    })

    player.ready(() => {
      player.volume(Number.isFinite(savedVol) ? savedVol : 0.7)
      if (typeof resumeAt === 'number' && resumeAt > 0) {
        player.currentTime(resumeAt)
      }
      // Prefer AirPlay when available (Safari)
      const el = player.el().querySelector('video') as HTMLVideoElement | null
      if (el) {
        el.setAttribute('x-webkit-airplay', 'allow')
        ;(el as HTMLVideoElement & { disableRemotePlayback?: boolean }).disableRemotePlayback = false
      }
    })

    const onVolume = () => {
      localStorage.setItem(VOLUME_KEY, String(player.volume()))
    }
    player.on('volumechange', onVolume)

    const onTime = () => {
      if (!streamId || isLive) return
      const map = JSON.parse(localStorage.getItem(RESUME_KEY) || '{}') as Record<string, number>
      map[streamId] = player.currentTime() || 0
      localStorage.setItem(RESUME_KEY, JSON.stringify(map))
    }
    player.on('timeupdate', onTime)

    const tryReconnect = () => {
      setReconnecting(true)
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
      reconnectTimer.current = window.setTimeout(() => {
        player.src({ src, type: src.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4' })
        player.load()
        player.play()?.catch(() => undefined)
        setReconnecting(false)
      }, 2500)
    }

    player.on('error', tryReconnect)
    player.on('waiting', () => {
      // If stuck waiting too long on live, nudge reload
      if (!isLive) return
      if (reconnectTimer.current) return
      reconnectTimer.current = window.setTimeout(() => {
        const err = player.error()
        if (err || player.paused()) tryReconnect()
        reconnectTimer.current = null
      }, 12000)
    })

    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return
      const step = 5
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          if (player.paused()) player.play()
          else player.pause()
          break
        case 'f':
          if (player.isFullscreen()) player.exitFullscreen()
          else player.requestFullscreen()
          break
        case 'm':
          player.muted(!player.muted())
          break
        case 'arrowup':
          e.preventDefault()
          player.volume(Math.min(1, (player.volume() || 0) + 0.05))
          break
        case 'arrowdown':
          e.preventDefault()
          player.volume(Math.max(0, (player.volume() || 0) - 0.05))
          break
        case 'arrowright':
          if (!isLive) player.currentTime((player.currentTime() || 0) + step)
          break
        case 'arrowleft':
          if (!isLive) player.currentTime(Math.max(0, (player.currentTime() || 0) - step))
          break
        case 'p':
          // Picture-in-picture
          {
            const v = player.el().querySelector('video') as HTMLVideoElement | null
            if (v && document.pictureInPictureEnabled) {
              if (document.pictureInPictureElement) document.exitPictureInPicture()
              else v.requestPictureInPicture().catch(() => undefined)
            }
          }
          break
        case 'i':
          setShowStats((s) => !s)
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)

    const statsInterval = window.setInterval(() => {
      try {
        const tech = player.tech({ IWillNotUseThisInPlugins: true }) as {
          vhs?: {
            stats?: { bandwidth?: number; mediaRequests?: number }
            playlists?: { media?: () => { attributes?: { RESOLUTION?: { width: number; height: number } } } }
          }
        }
        const vhs = tech?.vhs
        const buffered = player.bufferedEnd() - (player.currentTime() || 0)
        const res = vhs?.playlists?.media?.()?.attributes?.RESOLUTION
        const liveLatency =
          typeof (player as unknown as { liveTracker?: { latency: () => number } }).liveTracker?.latency === 'function'
            ? (player as unknown as { liveTracker: { latency: () => number } }).liveTracker.latency()
            : null
        setStats({
          bitrate: Math.round((vhs?.stats?.bandwidth || 0) / 1000),
          buffered: Math.max(0, Math.round(buffered * 10) / 10),
          latency: liveLatency != null ? Math.round(liveLatency * 10) / 10 : null,
          resolution: res ? `${res.width}x${res.height}` : 'auto',
          dropped: 0,
        })
      } catch {
        /* ignore */
      }
    }, 1500)

    playerRef.current = player
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearInterval(statsInterval)
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current)
      player.off('volumechange', onVolume)
      player.off('timeupdate', onTime)
      player.dispose()
      playerRef.current = null
    }
  }, [src, poster, autoplay, streamId, isLive])

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
      <div data-vjs-player className="vjs-theme-svlive">
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered min-h-[240px] w-full md:min-h-[420px]"
          playsInline
          crossOrigin="anonymous"
        />
      </div>

      {watermark ? (
        <div
          className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-[0.14]"
          aria-hidden
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute whitespace-nowrap text-xs font-medium text-white"
              style={{
                top: `${(i % 4) * 25 + 8}%`,
                left: `${Math.floor(i / 4) * 33 + (i % 2) * 8}%`,
                transform: 'rotate(-18deg)',
              }}
            >
              {watermark} · SV Live
            </span>
          ))}
        </div>
      ) : null}

      {reconnecting ? (
        <div className="absolute inset-x-0 top-0 z-10 bg-amber-500/90 px-3 py-1.5 text-center text-xs font-medium text-black">
          Reconnecting to stream…
        </div>
      ) : null}

      {showStats && stats ? (
        <div className="absolute bottom-14 left-3 z-10 rounded-lg bg-black/80 px-3 py-2 font-mono text-[10px] text-white/80 backdrop-blur">
          <p>Bitrate ~{stats.bitrate || '—'} kbps · Auto</p>
          <p>Buffer {stats.buffered}s · Latency {stats.latency != null ? `${stats.latency}s` : 'n/a'}</p>
          <p>Quality {stats.resolution} · Press I to hide</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowStats(true)}
          className="absolute bottom-14 left-3 z-10 rounded bg-black/50 px-2 py-1 text-[10px] text-white/50 opacity-0 transition group-hover:opacity-100"
        >
          Stats (I)
        </button>
      )}

      <style>{`
        .vjs-theme-svlive .vjs-control-bar {
          background: linear-gradient(transparent, rgba(0,0,0,.85));
          color: #f7e6a3;
        }
        .vjs-theme-svlive .vjs-play-progress,
        .vjs-theme-svlive .vjs-volume-level {
          background: #c9a14a;
        }
        .vjs-theme-svlive .vjs-big-play-button {
          border-color: #c9a14a;
          background: rgba(0,0,0,.45);
          color: #f7e6a3;
        }
      `}</style>
    </div>
  )
}
