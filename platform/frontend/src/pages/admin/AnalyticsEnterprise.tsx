import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { BarChart3, Globe, Smartphone, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'

type Enterprise = {
  revenue: { total: number; bookings: number; forecastNextMonth: number }
  bandwidthEstimateGb: number
  watchTimeHours: number
  returningVisitors: number
  byCountry: Record<string, number>
  byDevice: Record<string, number>
  byOs: Record<string, number>
  heatmap: Array<{ minuteRange: string; viewers: number }>
  topEvents: Array<{ title: string; peakViewers: number; eventType: string }>
}

export default function AdminAnalyticsEnterprise() {
  const [data, setData] = useState<Enterprise | null>(null)

  useEffect(() => {
    api.get('/analytics/enterprise').then((res) => setData(res.data.data)).catch(() => undefined)
  }, [])

  const maxHeat = Math.max(1, ...(data?.heatmap.map((h) => h.viewers) || [1]))

  return (
    <>
      <Helmet><title>Enterprise Analytics | Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold-light">Insights</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Enterprise Analytics</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={TrendingUp} label="Revenue" value={data ? `₹${data.revenue.total.toLocaleString()}` : '—'} />
          <Stat icon={BarChart3} label="Forecast" value={data ? `₹${data.revenue.forecastNextMonth.toLocaleString()}` : '—'} />
          <Stat icon={Globe} label="Bandwidth est." value={data ? `${data.bandwidthEstimateGb} GB` : '—'} />
          <Stat icon={Smartphone} label="Watch time" value={data ? `${data.watchTimeHours} h` : '—'} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="font-display text-lg">Retention heatmap</h2>
            <div className="mt-4 flex items-end gap-2 h-40">
              {(data?.heatmap || []).map((h) => (
                <div key={h.minuteRange} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-gold/80"
                    style={{ height: `${(h.viewers / maxHeat) * 100}%`, minHeight: h.viewers ? 4 : 0 }}
                  />
                  <span className="text-[10px] text-white/40">{h.minuteRange}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-display text-lg">Top events</h2>
            <ul className="mt-4 space-y-2">
              {(data?.topEvents || []).map((e) => (
                <li key={e.title} className="flex justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <span>{e.title} <span className="text-white/40">· {e.eventType}</span></span>
                  <span className="text-gold-light">{e.peakViewers} peak</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h2 className="font-display text-lg">Countries</h2>
            <Dist map={data?.byCountry || {}} />
          </Card>
          <Card className="p-5">
            <h2 className="font-display text-lg">Devices / OS</h2>
            <Dist map={data?.byDevice || {}} />
            <div className="mt-4" />
            <Dist map={data?.byOs || {}} />
          </Card>
        </div>
      </div>
    </>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40">
        <Icon className="h-3.5 w-3.5 text-gold-light" /> {label}
      </div>
      <p className="mt-3 font-display text-2xl">{value}</p>
    </Card>
  )
}

function Dist({ map }: { map: Record<string, number> }) {
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const max = Math.max(1, ...entries.map(([, v]) => v))
  return (
    <div className="mt-3 space-y-2">
      {entries.map(([k, v]) => (
        <div key={k}>
          <div className="mb-1 flex justify-between text-xs text-white/50">
            <span>{k}</span><span>{v}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gold" style={{ width: `${(v / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
