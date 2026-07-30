import { Helmet } from 'react-helmet-async'
import { Badge, statusBadge } from '@/components/ui/Badge'
import { adminBookings } from '@/data/dummy'
import { formatCurrency } from '@/lib/utils'

export default function AdminBookings() {
  return (
    <>
      <Helmet><title>Manage Bookings</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Bookings Management</h1>
      <div className="glass mt-8 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Event</th>
              <th className="p-4">Date</th><th className="p-4">Package</th><th className="p-4">Amount</th><th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {adminBookings.map((b) => (
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-mono text-gold-light">{b.id}</td>
                <td className="p-4">{b.customer}</td>
                <td className="p-4">{b.event}</td>
                <td className="p-4">{b.date}</td>
                <td className="p-4">{b.package}</td>
                <td className="p-4">{formatCurrency(b.amount)}</td>
                <td className="p-4"><Badge variant={statusBadge(b.status)}>{b.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
