import { Helmet } from 'react-helmet-async'
import { adminCustomers } from '@/data/dummy'
import { formatCurrency } from '@/lib/utils'

export default function AdminCustomers() {
  return (
    <>
      <Helmet><title>Customers</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Customers</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminCustomers.map((c) => (
          <div key={c.id} className="glass rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold font-bold text-[#090909]">
              {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <h3 className="mt-4 font-display font-semibold">{c.name}</h3>
            <p className="text-sm text-white/50">{c.email}</p>
            <p className="text-sm text-white/50">{c.phone}</p>
            <div className="mt-4 flex justify-between border-t border-white/5 pt-4 text-sm">
              <span>{c.bookings} bookings</span>
              <span className="text-gold-light">{formatCurrency(c.spent)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
