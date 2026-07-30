import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Badge, statusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { bookings } from '@/data/dummy'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DashboardBookings() {
  return (
    <>
      <Helmet><title>My Bookings</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">My Bookings</h1>
        <Link to="/booking"><Button>New Booking</Button></Link>
      </div>
      <div className="glass mt-8 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="p-4">Reference</th>
              <th className="p-4">Event</th>
              <th className="p-4">Type</th>
              <th className="p-4">Date</th>
              <th className="p-4">Package</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-mono text-gold-light">{b.id}</td>
                <td className="p-4">{b.event}</td>
                <td className="p-4">{b.type}</td>
                <td className="p-4">{formatDate(b.date)}</td>
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
