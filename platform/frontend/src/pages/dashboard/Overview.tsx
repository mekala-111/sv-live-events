import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Calendar, CreditCard, FileText, Video } from 'lucide-react'
import { Badge, statusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { bookings, invoices, recordings } from '@/data/dummy'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DashboardOverview() {
  const { user } = useAuth()

  return (
    <>
      <Helmet><title>Dashboard</title></Helmet>
      <div>
        <h1 className="font-display text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="mt-2 text-white/50">Manage your bookings, invoices, and recordings</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Calendar, label: 'Active Bookings', value: '2', color: 'text-gold-light' },
            { icon: FileText, label: 'Pending Invoices', value: '1', color: 'text-amber-300' },
            { icon: CreditCard, label: 'Total Spent', value: formatCurrency(164996), color: 'text-emerald-300' },
            { icon: Video, label: 'Recordings', value: '2', color: 'text-blue-300' },
          ].map((stat) => (
            <Card key={stat.label}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <p className="mt-4 font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-white/50">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Link to="/dashboard/bookings"><Button variant="ghost" size="sm">View all</Button></Link>
            </CardHeader>
            <div className="space-y-4">
              {bookings.slice(0, 3).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                  <div>
                    <p className="font-medium">{b.event}</p>
                    <p className="text-sm text-white/50">{formatDate(b.date)} · {b.package}</p>
                  </div>
                  <Badge variant={statusBadge(b.status)}>{b.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Link to="/dashboard/invoices"><Button variant="ghost" size="sm">View all</Button></Link>
            </CardHeader>
            <div className="space-y-4">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                  <div>
                    <p className="font-medium">{inv.id}</p>
                    <p className="text-sm text-white/50">{formatDate(inv.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gold-light">{formatCurrency(inv.amount)}</p>
                    <Badge variant={statusBadge(inv.status)}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader><CardTitle>Available Recordings</CardTitle></CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {recordings.map((rec) => (
              <div key={rec.id} className="rounded-xl bg-white/5 p-4">
                <p className="font-medium">{rec.title}</p>
                <p className="mt-1 text-sm text-white/50">{rec.duration} · Expires {rec.expires}</p>
                <Button variant="outline" size="sm" className="mt-3">Download</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
