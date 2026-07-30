import { Helmet } from 'react-helmet-async'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

const notifications = [
  { id: '1', title: 'Booking Confirmed', message: 'Your Mehta Wedding booking for Apr 18 has been confirmed.', time: '2 hours ago', read: false },
  { id: '2', title: 'Invoice Available', message: 'Invoice INV-2026-0891 is ready for download.', time: '1 day ago', read: false },
  { id: '3', title: 'Recording Expiring', message: 'Your AGM recording expires in 7 days.', time: '3 days ago', read: true },
  { id: '4', title: 'Payment Received', message: 'We received your payment of ₹49,999.', time: '1 week ago', read: true },
]

export default function DashboardNotifications() {
  return (
    <>
      <Helmet><title>Notifications</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Notifications</h1>
      <div className="mt-8 space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`glass flex gap-4 rounded-2xl p-5 ${!n.read ? 'border-gold/20' : ''}`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.read ? 'bg-white/5' : 'bg-gold/15'}`}>
              <Bell className={`h-5 w-5 ${n.read ? 'text-white/40' : 'text-gold'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{n.title}</p>
                {!n.read && <Badge variant="gold">New</Badge>}
              </div>
              <p className="mt-1 text-sm text-white/50">{n.message}</p>
              <p className="mt-2 text-xs text-white/30">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
