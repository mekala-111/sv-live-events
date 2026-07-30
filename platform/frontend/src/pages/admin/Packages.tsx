import { Helmet } from 'react-helmet-async'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { packages } from '@/data/dummy'
import { formatCurrency } from '@/lib/utils'

export default function AdminPackages() {
  return (
    <>
      <Helmet><title>Packages</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Package Management</h1>
        <Button>Add Package</Button>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {packages.map((pkg) => (
          <div key={pkg.id} className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold">{pkg.name}</h3>
                <p className="text-2xl text-gold-light">{pkg.custom ? 'Custom' : formatCurrency(pkg.price)}</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <ul className="mt-4 space-y-2">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                  <Check className="h-3 w-3 text-gold" />{f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}
