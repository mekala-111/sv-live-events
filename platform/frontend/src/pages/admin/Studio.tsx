import { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import {
  Camera, Clapperboard, Mic, Music, Radio, Sparkles, Square, MonitorPlay,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

type CameraRow = {
  id: string
  name: string
  sourceType: string
  isProgram: boolean
  isPreview: boolean
  ptzPan: number
  ptzTilt: number
  ptzZoom: number
}

type Overlay = { id: string; kind: string; label: string; visible: boolean; payload: string }

type StudioData = {
  stream: { id: string; title: string; slug: string; status: string; hlsUrl?: string | null }
  state: {
    layout: string
    audioMaster: number
    micLevel: number
    musicLevel: number
    musicMuted: boolean
    emergencySlate: boolean
    aiDirectorOn: boolean
    sceneName?: string | null
    programCameraId?: string | null
    previewCameraId?: string | null
  }
  cameras: CameraRow[]
  overlays: Overlay[]
  hotkeys: Record<string, string>
}

export default function AdminStudio() {
  const [params] = useSearchParams()
  const [streamId, setStreamId] = useState(params.get('streamId') || '')
  const [streams, setStreams] = useState<Array<{ id: string; title: string }>>([])
  const [data, setData] = useState<StudioData | null>(null)
  const [camName, setCamName] = useState('Camera 1')
  const [error, setError] = useState('')

  const loadStreams = async () => {
    const res = await api.get('/stream/events')
    setStreams((res.data?.data || []).map((s: { id: string; title: string }) => ({ id: s.id, title: s.title })))
  }

  const load = useCallback(async (id: string) => {
    if (!id) return
    const res = await api.get(`/studio/${id}`)
    setData(res.data.data)
  }, [])

  useEffect(() => {
    loadStreams().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (streamId) load(streamId).catch((e) => setError(e?.response?.data?.message || 'Failed to load studio'))
  }, [streamId, load])

  useEffect(() => {
    if (!data || !streamId) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      const cams = data.cameras
      if (e.key >= '1' && e.key <= '9') {
        const cam = cams[Number(e.key) - 1]
        if (cam) api.post(`/studio/${streamId}/take/${cam.id}`).then(() => load(streamId))
      }
      if (e.key.toLowerCase() === 't') api.post(`/studio/${streamId}/cut`).then(() => load(streamId))
      if (e.key.toLowerCase() === 's') {
        api.patch(`/studio/${streamId}/state`, { emergencySlate: !data.state.emergencySlate }).then(() => load(streamId))
      }
      if (e.key.toLowerCase() === 'a') {
        api.patch(`/studio/${streamId}/state`, { aiDirectorOn: !data.state.aiDirectorOn }).then(() => load(streamId))
      }
      if (e.key.toLowerCase() === 'm') {
        api.patch(`/studio/${streamId}/state`, { musicMuted: !data.state.musicMuted }).then(() => load(streamId))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [data, streamId, load])

  const addCamera = async () => {
    await api.post(`/studio/${streamId}/cameras`, {
      name: camName,
      sourceType: 'OBS',
      previewUrl: data?.stream.hlsUrl || undefined,
    })
    setCamName(`Camera ${((data?.cameras.length || 0) + 2)}`)
    await load(streamId)
  }

  const addOverlay = async (kind: string, label: string, payload: Record<string, unknown>) => {
    await api.post(`/studio/${streamId}/overlays`, { kind, label, payload, visible: true })
    await load(streamId)
  }

  const program = data?.cameras.find((c) => c.isProgram)
  const preview = data?.cameras.find((c) => c.isPreview)

  return (
    <>
      <Helmet><title>Director Studio | Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold-light">Production</p>
            <h1 className="mt-2 font-display text-3xl font-bold">Multi-Camera Director Console</h1>
            <p className="mt-2 text-white/50">Preview / Program · PTZ · overlays · AI director · OBS remote</p>
          </div>
          <select
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
            value={streamId}
            onChange={(e) => setStreamId(e.target.value)}
          >
            <option value="">Select stream</option>
            {streams.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#111]">{s.title}</option>
            ))}
          </select>
        </div>

        {error ? <p className="text-red-300">{error}</p> : null}
        {!streamId ? <Card className="p-8 text-center text-white/50">Select a live event to open the studio.</Card> : null}

        {data ? (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <Monitor label="PREVIEW" cam={preview} slate={false} />
              <Monitor label="PROGRAM" cam={program} slate={data.state.emergencySlate} live />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2 text-gold-light">
                  <Camera className="h-4 w-4" /> Sources
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.cameras.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`rounded-2xl border p-4 text-left transition ${
                        c.isProgram ? 'border-red-400/60 bg-red-500/10' : c.isPreview ? 'border-amber-400/50 bg-amber-500/10' : 'border-white/10 bg-white/5'
                      }`}
                      onClick={() => api.post(`/studio/${streamId}/preview/${c.id}`).then(() => load(streamId))}
                      onDoubleClick={() => api.post(`/studio/${streamId}/take/${c.id}`).then(() => load(streamId))}
                    >
                      <p className="text-xs text-white/40">[{i + 1}] {c.sourceType}</p>
                      <p className="mt-1 font-medium">{c.name}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-wider text-white/40">
                        {c.isProgram ? 'Program' : c.isPreview ? 'Preview' : 'Standby'}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Input value={camName} onChange={(e) => setCamName(e.target.value)} className="max-w-xs" />
                  <Button onClick={addCamera}>Add Camera</Button>
                  <Button variant="ghost" onClick={() => api.post(`/studio/${streamId}/cut`).then(() => load(streamId))}>
                    Take (T)
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      api.patch(`/studio/${streamId}/state`, { emergencySlate: !data.state.emergencySlate }).then(() => load(streamId))
                    }
                  >
                    <Square className="h-4 w-4" /> Slate (S)
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      api.patch(`/studio/${streamId}/state`, { aiDirectorOn: !data.state.aiDirectorOn }).then(() => load(streamId))
                    }
                  >
                    <Sparkles className="h-4 w-4" /> AI Director {data.state.aiDirectorOn ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </Card>

              <div className="space-y-4">
                <Card className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-gold-light"><Mic className="h-4 w-4" /> Audio Mixer</div>
                  <Slider
                    label="Master"
                    value={data.state.audioMaster}
                    onChange={(v) => api.patch(`/studio/${streamId}/state`, { audioMaster: v }).then(() => load(streamId))}
                  />
                  <Slider
                    label="Mic"
                    value={data.state.micLevel}
                    onChange={(v) => api.patch(`/studio/${streamId}/state`, { micLevel: v }).then(() => load(streamId))}
                  />
                  <Slider
                    label="Music"
                    value={data.state.musicLevel}
                    onChange={(v) => api.patch(`/studio/${streamId}/state`, { musicLevel: v }).then(() => load(streamId))}
                  />
                  <Button
                    variant="ghost"
                    className="mt-2 w-full"
                    onClick={() =>
                      api.patch(`/studio/${streamId}/state`, { musicMuted: !data.state.musicMuted }).then(() => load(streamId))
                    }
                  >
                    <Music className="h-4 w-4" /> {data.state.musicMuted ? 'Unmute Music' : 'Mute Music'} (M)
                  </Button>
                </Card>

                <Card className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-gold-light"><Clapperboard className="h-4 w-4" /> Overlays</div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" className="!px-3" onClick={() => addOverlay('LOGO', 'Logo', { url: '/logo.png' })}>Logo</Button>
                    <Button variant="ghost" className="!px-3" onClick={() => addOverlay('LOWER_THIRD', 'Lower Third', { title: 'Guest', subtitle: 'Family' })}>Lower Third</Button>
                    <Button variant="ghost" className="!px-3" onClick={() => addOverlay('TICKER', 'Ticker', { text: 'Welcome to SV Live Events' })}>Ticker</Button>
                    <Button variant="ghost" className="!px-3" onClick={() => addOverlay('COUNTDOWN', 'Countdown', { seconds: 300 })}>Countdown</Button>
                    <Button variant="ghost" className="!px-3" onClick={() => addOverlay('SCOREBOARD', 'Score', { home: 0, away: 0 })}>Scoreboard</Button>
                    <Button variant="ghost" className="!px-3" onClick={() => addOverlay('SPONSOR', 'Sponsor', { name: 'Sponsor' })}>Sponsor</Button>
                    <Button variant="ghost" className="!px-3" onClick={() => addOverlay('NAME_CARD', 'Name Card', { name: 'Speaker' })}>Name Card</Button>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {data.overlays.map((o) => (
                      <li key={o.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                        <span>{o.kind} · {o.label}</span>
                        <button
                          type="button"
                          className="text-xs text-gold-light"
                          onClick={() => api.patch(`/studio/overlays/${o.id}`, { visible: !o.visible }).then(() => load(streamId))}
                        >
                          {o.visible ? 'Hide' : 'Show'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-5 text-xs text-white/45">
                  <p className="mb-2 flex items-center gap-2 text-gold-light"><Radio className="h-3.5 w-3.5" /> Hotkeys</p>
                  {Object.entries(data.hotkeys).map(([k, v]) => (
                    <p key={k}><span className="text-white/70">{k}</span> — {v}</p>
                  ))}
                  <Button
                    className="mt-3 w-full"
                    variant="ghost"
                    onClick={() => api.post(`/studio/${streamId}/obs-remote`, { action: 'scene', scene: 'Ceremony' })}
                  >
                    OBS Remote: Ceremony Scene
                  </Button>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  )
}

function Monitor({
  label,
  cam,
  slate,
  live,
}: {
  label: string
  cam?: CameraRow
  slate: boolean
  live?: boolean
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 text-xs uppercase tracking-wider text-white/50">
        <span className="flex items-center gap-2"><MonitorPlay className="h-3.5 w-3.5" /> {label}</span>
        {live ? <span className="text-red-400">● On Air</span> : null}
      </div>
      <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#050505]">
        {slate ? (
          <p className="font-display text-2xl text-white/80">EMERGENCY SLATE</p>
        ) : (
          <div className="text-center">
            <p className="font-display text-xl">{cam?.name || 'No source'}</p>
            <p className="mt-1 text-xs text-white/40">{cam?.sourceType || '—'}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="mt-3 block text-xs text-white/50">
      {label} · {Math.round(value * 100)}%
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[#c9a14a]"
      />
    </label>
  )
}
