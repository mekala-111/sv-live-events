import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
  Copy, KeyRound, Pause, Plus, Radio, Square, Play, Trash2, Users, Calendar,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface StreamRow {
  id: string
  title: string
  slug: string
  eventType: string
  status: string
  streamKey: string
  rtmpUrl: string
  hlsUrl?: string | null
  publisherToken?: string | null
  currentViewers: number
  peakViewers: number
  scheduledAt?: string | null
  createdAt: string
  _count?: { sessions: number; messages: number; recordings: number }
}

interface CreatedCreds extends StreamRow {
  password: string
  viewerUrl: string
  obs: { server: string; streamKey: string; publisherToken?: string; notes: string }
}

export default function AdminStreams() {
  const [streams, setStreams] = useState<StreamRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    eventType: 'Wedding',
    description: '',
    password: '',
    scheduledAt: '',
    slowModeSec: '0',
  })
  const [created, setCreated] = useState<CreatedCreds | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/stream/events')
      setStreams(res.data?.data || [])
    } catch {
      setError('Unable to load streams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = window.setInterval(load, 15000)
    return () => window.clearInterval(id)
  }, [])

  const createStream = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const res = await api.post('/stream/events', {
        title: form.title,
        eventType: form.eventType,
        description: form.description || undefined,
        password: form.password || undefined,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
        slowModeSec: Number(form.slowModeSec) || 0,
        isRecording: true,
      })
      setCreated(res.data.data)
      setForm({ title: '', eventType: 'Wedding', description: '', password: '', scheduledAt: '', slowModeSec: '0' })
      await load()
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  const start = async (id: string) => {
    await api.post(`/stream/events/${id}/start`)
    await load()
  }
  const pause = async (id: string) => {
    await api.post(`/stream/events/${id}/pause`)
    await load()
  }
  const resume = async (id: string) => {
    await api.post(`/stream/events/${id}/resume`)
    await load()
  }
  const stop = async (id: string) => {
    await api.post(`/stream/events/${id}/stop`)
    await load()
  }
  const regen = async (id: string) => {
    if (!confirm('Regenerate stream key? OBS will need the new key.')) return
    const res = await api.post(`/stream/events/${id}/regenerate-key`)
    setCreated({
      ...(streams.find((s) => s.id === id) as StreamRow),
      ...res.data.data,
      password: '(unchanged)',
      viewerUrl: `${window.location.origin}/live/${res.data.data.slug}`,
      obs: res.data.data.obs,
    })
    await load()
  }
  const remove = async (id: string) => {
    if (!confirm('Delete this stream permanently?')) return
    await api.delete(`/stream/events/${id}`)
    await load()
  }

  return (
    <>
      <Helmet><title>Live Streams | Admin</title></Helmet>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold-light">Streaming</p>
            <h1 className="mt-2 font-display text-3xl font-bold">Live Stream Management</h1>
            <p className="mt-2 text-white/50">
              OBS → SRS → HLS. Schedule events, pause/resume, regenerate keys.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/studio"><Button variant="ghost">Director Studio</Button></Link>
            <Link to="/admin/ops"><Button variant="ghost">Live Ops</Button></Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 text-gold-light">
              <Plus className="h-5 w-5" /> Create Live Event
            </div>
            <form onSubmit={createStream} className="space-y-4">
              <Input
                label="Event Name"
                placeholder="Rahul & Priya Wedding"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <label className="block text-sm text-white/60">
                Event Type
                <select
                  className="mt-2 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  value={form.eventType}
                  onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                >
                  {['Wedding', 'Corporate', 'Temple', 'Birthday', 'Conference', 'Concert', 'Sports', 'Funeral'].map((t) => (
                    <option key={t} value={t} className="bg-[#111]">{t}</option>
                  ))}
                </select>
              </label>
              <Input
                label="Schedule (optional)"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              />
              <Input
                label="Slow mode (seconds)"
                type="number"
                value={form.slowModeSec}
                onChange={(e) => setForm((f) => ({ ...f, slowModeSec: e.target.value }))}
              />
              <Input
                label="Custom Password (optional)"
                placeholder="Auto-generated if empty"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
              <Input
                label="Description"
                placeholder="Private family viewing"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? 'Generating…' : 'Generate Stream Credentials'}
              </Button>
            </form>

            {created ? (
              <div className="mt-6 space-y-3 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm">
                <p className="font-medium text-gold-light">Credentials (copy now)</p>
                <Cred label="RTMP URL" value={created.rtmpUrl || created.obs?.server} />
                <Cred label="Stream Key" value={created.streamKey || created.obs?.streamKey} />
                {created.obs?.publisherToken || created.publisherToken ? (
                  <Cred label="Publisher Token" value={created.obs?.publisherToken || created.publisherToken || ''} />
                ) : null}
                <Cred label="Viewer URL" value={created.viewerUrl} />
                <Cred label="Password" value={created.password} />
                <p className="text-xs text-white/50">{created.obs?.notes}</p>
              </div>
            ) : null}
          </Card>

          <div className="space-y-4">
            {loading ? <p className="text-white/50">Loading streams…</p> : null}
            {!loading && streams.length === 0 ? (
              <Card className="p-8 text-center text-white/50">No streams yet. Create your first private event.</Card>
            ) : null}
            {streams.map((s) => (
              <Card key={s.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Radio className={`h-4 w-4 ${s.status === 'LIVE' ? 'text-red-400' : 'text-white/40'}`} />
                      <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/70">
                        {s.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/50">{s.eventType} · /live/{s.slug}</p>
                    {s.scheduledAt ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-gold-light/80">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(s.scheduledAt).toLocaleString()}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/45">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {s.currentViewers} live / {s.peakViewers} peak
                      </span>
                      <span>{s._count?.sessions || 0} sessions</span>
                      <span>{s._count?.recordings || 0} recordings</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-white/40">
                      <p>RTMP: {s.rtmpUrl}</p>
                      <p>Key: {s.streamKey}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/live/${s.slug}`} target="_blank">
                      <Button variant="ghost" className="!px-3">Open Viewer</Button>
                    </Link>
                    {s.status === 'LIVE' ? (
                      <>
                        <Button variant="ghost" className="!px-3" onClick={() => pause(s.id)}>
                          <Pause className="h-4 w-4" /> Pause
                        </Button>
                        <Button variant="ghost" className="!px-3" onClick={() => stop(s.id)}>
                          <Square className="h-4 w-4" /> End
                        </Button>
                      </>
                    ) : s.status === 'PAUSED' || s.status === 'OFFLINE' ? (
                      <>
                        <Button className="!px-3" onClick={() => resume(s.id)}>
                          <Play className="h-4 w-4" /> Resume
                        </Button>
                        <Button variant="ghost" className="!px-3" onClick={() => stop(s.id)}>
                          <Square className="h-4 w-4" /> End
                        </Button>
                      </>
                    ) : s.status !== 'ENDED' && s.status !== 'ARCHIVED' ? (
                      <Button className="!px-3" onClick={() => start(s.id)}>
                        <Play className="h-4 w-4" /> Go Live
                      </Button>
                    ) : null}
                    <Button variant="ghost" className="!px-3" onClick={() => regen(s.id)}>
                      <KeyRound className="h-4 w-4" /> Regen Key
                    </Button>
                    <Button variant="ghost" className="!px-3 text-red-300" onClick={() => remove(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function Cred({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-black/30 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
        <p className="truncate text-white/90">{value}</p>
      </div>
      <button type="button" onClick={() => navigator.clipboard.writeText(value)} className="text-gold-light">
        <Copy className="h-4 w-4" />
      </button>
    </div>
  )
}
