import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Download, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Exec = {
  revenue: number
  mrr: number
  profit: number
  costs: { cdnCost: number; storageCost: number; bandwidthCost: number }
  activeTenants: number
  churn: number
  forecast: number
  bookings: number
  liveStreams: number
  nodes: { total: number; healthy: number; draining: number }
}

export default function AdminReporting() {
  const [data, setData] = useState<Exec | null>(null)

  useEffect(() => {
    api.get('/reporting/executive').then((r) => setData(r.data.data)).catch(() => undefined)
  }, [])

  return (
    <>
      <Helmet><title>Executive Reporting | Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold-light">Finance</p>
            <h1 className="mt-2 font-display text-3xl font-bold">Executive Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <a href="/api/reporting/export?format=csv" target="_blank" rel="noreferrer">
              <Button variant="ghost"><Download className="h-4 w-4" /> Excel/CSV</Button>
            </a>
            <a href="/api/reporting/export?format=pdf" target="_blank" rel="noreferrer">
              <Button variant="ghost"><Download className="h-4 w-4" /> PDF</Button>
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Revenue" value={data ? `₹${data.revenue.toLocaleString()}` : '—'} />
          <Stat label="MRR" value={data ? `₹${data.mrr.toLocaleString()}` : '—'} />
          <Stat label="Profit" value={data ? `₹${data.profit.toLocaleString()}` : '—'} />
          <Stat label="Forecast" value={data ? `₹${data.forecast.toLocaleString()}` : '—'} icon />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5">
            <h2 className="font-display text-lg">Costs</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li className="flex justify-between"><span>CDN</span><span>₹{data?.costs.cdnCost ?? '—'}</span></li>
              <li className="flex justify-between"><span>Bandwidth</span><span>₹{data?.costs.bandwidthCost ?? '—'}</span></li>
              <li className="flex justify-between"><span>Storage</span><span>₹{data?.costs.storageCost ?? '—'}</span></li>
            </ul>
          </Card>
          <Card className="p-5">
            <h2 className="font-display text-lg">Tenants</h2>
            <p className="mt-3 text-3xl font-display">{data?.activeTenants ?? '—'}</p>
            <p className="text-sm text-white/50">Churn proxy: {data?.churn ?? 0}</p>
          </Card>
          <Card className="p-5">
            <h2 className="font-display text-lg">Cluster</h2>
            <p className="mt-3 text-sm text-white/70">
              {data?.nodes.healthy}/{data?.nodes.total} healthy · {data?.nodes.draining} draining
            </p>
            <p className="mt-2 text-sm text-white/50">{data?.liveStreams ?? 0} live · {data?.bookings ?? 0} bookings</p>
          </Card>
        </div>
      </div>
    </>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <Card className="p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40">
        {icon ? <TrendingUp className="h-3.5 w-3.5 text-gold-light" /> : null}
        {label}
      </p>
      <p className="mt-3 font-display text-2xl">{value}</p>
    </Card>
  )
}
