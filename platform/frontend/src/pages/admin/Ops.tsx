import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Activity, Cpu, HardDrive, MemoryStick, Radio, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'

type OpsData = {
  system: {
    cpuCount: number
    cpuModel?: string
    loadAvg: number[]
    ram: { totalMb: number; usedMb: number; freeMb: number; usedPercent: number }
    disk: { freeGb: number | null; totalGb: number | null }
    uptimeSec: number
    hostname: string
  }
  streaming: {
    currentViewers: number
    liveCount: number
    bandwidthEstimateMbps: number
    live: Array<{ id: string; title: string; status: string; currentViewers: number; slug: string }>
    upcoming: Array<{ id: string; title: string; scheduledAt: string | null }>
    completed: Array<{ id: string; title: string; endedAt: string | null }>
    cancelled: Array<{ id: string; title: string }>
    mostViewed: { title: string; peakViewers: number; slug: string } | null
  }
}

export default function AdminOps() {
  const [data, setData] = useState<OpsData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await api.get('/stream/ops/dashboard')
        if (alive) setData(res.data.data)
      } catch {
        if (alive) setError('Unable to load ops metrics')
      }
    }
    load()
    const id = window.setInterval(load, 5000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [])

  const sys = data?.system
  const st = data?.streaming

  return (
    <>
      <Helmet><title>Live Ops | Admin</title></Helmet>
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold-light">Operations</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Live Ops Dashboard</h1>
          <p className="mt-2 text-white/50">Realtime host metrics and concurrent streams.</p>
        </div>

        {error ? <p className="text-red-300">{error}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Users} label="Current viewers" value={String(st?.currentViewers ?? '—')} />
          <Metric icon={Radio} label="Live streams" value={String(st?.liveCount ?? '—')} />
          <Metric icon={Activity} label="Est. bandwidth" value={st ? `${st.bandwidthEstimateMbps} Mbps` : '—'} />
          <Metric icon={Cpu} label="Load avg" value={sys ? sys.loadAvg.map((n) => n.toFixed(2)).join(' / ') : '—'} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2 text-gold-light">
              <MemoryStick className="h-4 w-4" /> RAM
            </div>
            <p className="font-display text-3xl">{sys?.ram.usedPercent ?? '—'}%</p>
            <p className="mt-2 text-sm text-white/50">
              {sys ? `${sys.ram.usedMb} / ${sys.ram.totalMb} MB` : '—'}
            </p>
            <Bar pct={sys?.ram.usedPercent ?? 0} />
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2 text-gold-light">
              <HardDrive className="h-4 w-4" /> Disk
            </div>
            <p className="font-display text-3xl">
              {sys?.disk.freeGb != null ? `${sys.disk.freeGb} GB` : '—'}
            </p>
            <p className="mt-2 text-sm text-white/50">
              free of {sys?.disk.totalGb != null ? `${sys.disk.totalGb} GB` : '—'}
            </p>
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2 text-gold-light">
              <Cpu className="h-4 w-4" /> Host
            </div>
            <p className="truncate font-display text-xl">{sys?.hostname ?? '—'}</p>
            <p className="mt-2 text-sm text-white/50">
              {sys?.cpuCount} cores · uptime {sys ? Math.round(sys.uptimeSec / 3600) : '—'}h
            </p>
            <p className="mt-1 truncate text-xs text-white/35">{sys?.cpuModel}</p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="font-display text-lg">Live now</h2>
            <div className="mt-4 space-y-3">
              {(st?.live || []).length === 0 ? (
                <p className="text-sm text-white/40">No active ingest</p>
              ) : (
                st?.live.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-white/40">{s.status} · /live/{s.slug}</p>
                    </div>
                    <span className="text-gold-light">{s.currentViewers} viewers</span>
                  </div>
                ))
              )}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-display text-lg">Most viewed</h2>
            {st?.mostViewed ? (
              <div className="mt-4 rounded-xl bg-gold/10 px-4 py-3">
                <p className="font-medium text-gold-light">{st.mostViewed.title}</p>
                <p className="text-sm text-white/60">Peak {st.mostViewed.peakViewers} · /live/{st.mostViewed.slug}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-white/40">No data yet</p>
            )}
            <h3 className="mt-6 text-sm uppercase tracking-wider text-white/40">Upcoming</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {(st?.upcoming || []).slice(0, 5).map((s) => (
                <li key={s.id} className="flex justify-between gap-2 text-white/70">
                  <span className="truncate">{s.title}</span>
                  <span className="shrink-0 text-xs text-white/40">
                    {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : '—'}
                  </span>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm uppercase tracking-wider text-white/40">Completed</h3>
            <ul className="mt-2 space-y-2 text-sm text-white/60">
              {(st?.completed || []).slice(0, 5).map((s) => (
                <li key={s.id}>{s.title}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40">
        <Icon className="h-3.5 w-3.5 text-gold-light" /> {label}
      </div>
      <p className="mt-3 font-display text-2xl">{value}</p>
    </Card>
  )
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}
