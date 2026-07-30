import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

type Lead = { id: string; name: string; email?: string | null; stage: string; valueInr: number; followUpAt?: string | null }
type Pipe = { stage: string; count: number; valueInr: number }

export default function AdminCrm() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [pipeline, setPipeline] = useState<Pipe[]>([])
  const [form, setForm] = useState({ name: '', email: '', valueInr: '0' })

  const load = async () => {
    const [l, p] = await Promise.all([api.get('/crm/leads'), api.get('/crm/pipeline')])
    setLeads(l.data?.data || [])
    setPipeline(p.data?.data || [])
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/crm/leads', {
      name: form.name,
      email: form.email || undefined,
      valueInr: Number(form.valueInr) || 0,
      stage: 'NEW',
    })
    setForm({ name: '', email: '', valueInr: '0' })
    await load()
  }

  return (
    <>
      <Helmet><title>CRM | Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold-light">Sales</p>
          <h1 className="mt-2 font-display text-3xl font-bold">CRM & Pipeline</h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {pipeline.map((p) => (
            <Card key={p.stage} className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40">{p.stage}</p>
              <p className="mt-2 font-display text-xl">{p.count}</p>
              <p className="text-xs text-gold-light">₹{p.valueInr.toLocaleString()}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <Card className="p-5">
            <form onSubmit={create} className="space-y-3">
              <Input label="Lead name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <Input label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Value (INR)" value={form.valueInr} onChange={(e) => setForm((f) => ({ ...f, valueInr: e.target.value }))} />
              <Button type="submit" className="w-full">Add lead</Button>
            </form>
          </Card>
          <Card className="p-5">
            <div className="space-y-2">
              {leads.map((l) => (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{l.name}</p>
                    <p className="text-xs text-white/40">{l.email || '—'} · ₹{l.valueInr.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {['QUALIFIED', 'PROPOSAL', 'WON'].map((stage) => (
                      <Button key={stage} variant="ghost" className="!px-2 text-[10px]" onClick={() => api.patch(`/crm/leads/${l.id}`, { stage }).then(load)}>
                        {stage}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {leads.length === 0 ? <p className="text-white/40">No leads yet.</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
