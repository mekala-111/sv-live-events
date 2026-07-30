import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

type User = {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
  customer?: { id: string } | null
}

type Booking = {
  userId: string
  totalAmount: number
  paymentStatus: string
}

export default function AdminCustomers() {
  const usersQ = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => (await api.get<{ data: User[] }>('/admin/users', { params: { role: 'CUSTOMER' } })).data.data,
  })
  const bookingsQ = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => (await api.get<{ data: Booking[] }>('/bookings')).data.data,
  })

  const rows = (usersQ.data ?? []).map((u) => {
    const mine = (bookingsQ.data ?? []).filter((b) => b.userId === u.id)
    const spent = mine.filter((b) => b.paymentStatus === 'PAID').reduce((s, b) => s + b.totalAmount, 0)
    return { ...u, bookings: mine.length, spent }
  })

  return (
    <>
      <Helmet><title>Customers</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Customers</h1>
      {usersQ.isError && <p className="mt-4 text-sm text-red-400">Could not load customers</p>}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => (
          <div key={c.id} className="glass rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold font-bold text-[#090909]">
              {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <h3 className="mt-4 font-display font-semibold">{c.name}</h3>
            <p className="text-sm text-white/50">{c.email}</p>
            <p className="text-sm text-white/50">{c.phone || '—'}</p>
            <div className="mt-4 flex justify-between border-t border-white/5 pt-4 text-sm">
              <span>{c.bookings} bookings</span>
              <span className="text-gold-light">{formatCurrency(c.spent)}</span>
            </div>
          </div>
        ))}
        {!usersQ.isLoading && !rows.length && <p className="text-white/40">No customers yet</p>}
      </div>
    </>
  )
}
