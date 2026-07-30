import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

type Pkg = {
  id: string
  name: string
  price: number
  features: string
  isPopular?: boolean
}

function parseFeatures(raw: string): string[] {
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v.map(String) : [raw]
  } catch {
    return raw ? raw.split('\n').filter(Boolean) : []
  }
}

export default function AdminPackages() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => (await api.get<{ data: Pkg[] }>('/packages')).data.data,
  })

  return (
    <>
      <Helmet><title>Packages</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Package Management</h1>
        <Button disabled title="Create via API / seed">Add Package</Button>
      </div>
      {isError && <p className="mt-4 text-sm text-red-400">Could not load packages</p>}
      {isLoading && <p className="mt-4 text-sm text-white/40">Loading…</p>}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {data.map((pkg) => (
          <div key={pkg.id} className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold">{pkg.name}</h3>
                <p className="text-2xl text-gold-light">{formatCurrency(pkg.price)}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {parseFeatures(pkg.features).map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                  <Check className="h-3 w-3 text-gold" />{f}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!isLoading && !data.length && <p className="text-white/40">No packages yet</p>}
      </div>
    </>
  )
}
