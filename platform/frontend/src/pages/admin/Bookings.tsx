import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Badge, statusBadge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

type Booking = {
  id: string
  bookingCode: string
  eventTitle: string
  eventDate: string
  totalAmount: number
  status: string
  package?: { name: string }
  user?: { name: string; email: string }
}

export default function AdminBookings() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => (await api.get<{ data: Booking[] }>('/bookings')).data.data,
  })

  return (
    <>
      <Helmet><title>Manage Bookings</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Bookings Management</h1>
      {isError && <p className="mt-4 text-sm text-red-400">Could not load bookings</p>}
      <div className="glass mt-8 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Event</th>
              <th className="p-4">Date</th><th className="p-4">Package</th><th className="p-4">Amount</th><th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="p-4 text-white/40" colSpan={7}>Loading…</td></tr>}
            {data.map((b) => (
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-mono text-gold-light">{b.bookingCode}</td>
                <td className="p-4">{b.user?.name ?? '—'}</td>
                <td className="p-4">{b.eventTitle}</td>
                <td className="p-4">{new Date(b.eventDate).toLocaleDateString()}</td>
                <td className="p-4">{b.package?.name ?? '—'}</td>
                <td className="p-4">{formatCurrency(b.totalAmount)}</td>
                <td className="p-4"><Badge variant={statusBadge(b.status)}>{b.status}</Badge></td>
              </tr>
            ))}
            {!isLoading && !data.length && (
              <tr><td className="p-4 text-white/40" colSpan={7}>No bookings yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
