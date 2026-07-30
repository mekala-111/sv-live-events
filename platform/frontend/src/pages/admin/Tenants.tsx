import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Building2, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

type Tenant = {
  id: string
  name: string
  slug: string
  customDomain?: string | null
  primaryColor: string
  usageMinutes: number
  usageBandwidthGb: number
  plan?: { name: string; monthlyPrice: number } | null
  _count?: { users: number; streams: number }
}

export default function AdminTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [plans, setPlans] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [form, setForm] = useState({ name: '', slug: '', billingEmail: '', planId: '' })

  const load = async () => {
    const [t, p] = await Promise.all([api.get('/tenants'), api.get('/tenants/plans')])
    setTenants(t.data?.data || [])
    setPlans(p.data?.data || [])
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/tenants', {
      name: form.name,
      slug: form.slug,
      billingEmail: form.billingEmail || undefined,
      planId: form.planId || undefined,
    })
    setForm({ name: '', slug: '', billingEmail: '', planId: '' })
    await load()
  }

  return (
    <>
      <Helmet><title>Tenants | Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold-light">SaaS</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Multi-Tenant Control</h1>
          <p className="mt-2 text-white/50">Domains · branding · plans · usage billing (row-level isolation)</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2 text-gold-light"><Plus className="h-4 w-4" /> New tenant</div>
            <form onSubmit={create} className="space-y-3">
              <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <Input label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))} required />
              <Input label="Billing email" value={form.billingEmail} onChange={(e) => setForm((f) => ({ ...f, billingEmail: e.target.value }))} />
              <label className="block text-sm text-white/60">
                Plan
                <select
                  className="mt-2 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3"
                  value={form.planId}
                  onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
                >
                  <option value="">None</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#111]">{p.name}</option>
                  ))}
                </select>
              </label>
              <Button type="submit" className="w-full">Create tenant</Button>
            </form>
          </Card>

          <div className="space-y-3">
            {tenants.map((t) => (
              <Card key={t.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl p-3" style={{ background: `${t.primaryColor}22`, color: t.primaryColor }}>
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t.name}</h3>
                    <p className="text-sm text-white/50">
                      {t.slug}{t.customDomain ? ` · ${t.customDomain}` : ''} · {t.plan?.name || 'No plan'}
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      {t._count?.users || 0} users · {t._count?.streams || 0} streams · {t.usageMinutes} min · {t.usageBandwidthGb} GB
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            {tenants.length === 0 ? <Card className="p-8 text-center text-white/50">No tenants yet.</Card> : null}
          </div>
        </div>
      </div>
    </>
  )
}
