import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Globe, Server, Activity } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Node = {
  id: string
  name: string
  role: string
  region: string
  city?: string | null
  status: string
  cpuPercent: number
  bandwidthMbps: number
  activeStreams: number
  activeViewers: number
}

export default function AdminCluster() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [scaling, setScaling] = useState<{ actions: Array<{ action: string; reason: string }> } | null>(null)

  const load = async () => {
    const [n, s] = await Promise.all([api.get('/cluster/nodes'), api.get('/cluster/autoscaling')])
    setNodes(n.data?.data || [])
    setScaling(s.data?.data || null)
  }

  useEffect(() => {
    load().catch(() => undefined)
    const id = window.setInterval(() => load().catch(() => undefined), 8000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <>
      <Helmet><title>Stream Cluster | Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold-light">Global</p>
            <h1 className="mt-2 font-display text-3xl font-bold">Stream Cluster</h1>
            <p className="mt-2 text-white/50">Origins · edges · health · drain · autoscaling</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => api.post('/cluster/rolling-upgrade', {}).then(() => load())}
          >
            Plan rolling upgrade
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase text-white/40"><Server className="h-3.5 w-3.5 text-gold-light" /> Origins</div>
            <p className="mt-2 font-display text-2xl">{nodes.filter((n) => n.role === 'ORIGIN').length}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase text-white/40"><Globe className="h-3.5 w-3.5 text-gold-light" /> Edges</div>
            <p className="mt-2 font-display text-2xl">{nodes.filter((n) => n.role === 'EDGE').length}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase text-white/40"><Activity className="h-3.5 w-3.5 text-gold-light" /> Scale actions</div>
            <p className="mt-2 font-display text-2xl">{scaling?.actions?.length ?? 0}</p>
          </Card>
        </div>

        {(scaling?.actions || []).length > 0 ? (
          <Card className="space-y-2 p-5">
            <h2 className="font-display text-lg">Autoscaling recommendations</h2>
            {scaling?.actions.map((a, i) => (
              <p key={i} className="text-sm text-white/60">{a.action}: {a.reason}</p>
            ))}
          </Card>
        ) : null}

        <div className="grid gap-3">
          {nodes.map((n) => (
            <Card key={n.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{n.name} <span className="text-xs text-white/40">{n.role} · {n.region}</span></p>
                <p className="text-xs text-white/45">
                  CPU {n.cpuPercent}% · {n.bandwidthMbps} Mbps · {n.activeStreams} streams · {n.activeViewers} viewers
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${n.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300' : n.status === 'DRAINING' ? 'bg-amber-500/20 text-amber-200' : 'bg-red-500/20 text-red-300'}`}>
                  {n.status}
                </span>
                {n.status !== 'DRAINING' ? (
                  <Button variant="ghost" className="!px-3" onClick={() => api.post(`/cluster/nodes/${n.id}/drain`).then(load)}>Drain</Button>
                ) : (
                  <Button variant="ghost" className="!px-3" onClick={() => api.post(`/cluster/nodes/${n.id}/undrain`).then(load)}>Undrain</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
