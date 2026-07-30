import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Calendar, CreditCard, RefreshCw, TrendingUp, Users } from 'lucide-react'
import { Badge, statusBadge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

type Dash = {
  counts: {
    users: number
    bookings: number
    pendingBookings: number
    confirmedBookings: number
    streams: number
    liveStreams: number
    currentViewers: number
    peakViewers: number
  }
  revenue: number
  charts: {
    revenue: { month: string; revenue: number }[]
    bookings: { month: string; bookings: number }[]
  }
  recentBookings: {
    id: string
    bookingCode: string
    eventTitle: string
    eventDate: string
    totalAmount: number
    status: string
    paymentStatus: string
    packageName?: string
    user?: { name: string; email: string }
  }[]
}

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get<{ data: Dash }>('/admin/dashboard')).data.data,
    refetchInterval: 30000,
  })

  const stats = [
    { icon: TrendingUp, label: 'Revenue (paid)', value: formatCurrency(data?.revenue ?? 0), color: 'text-emerald-400' },
    { icon: Calendar, label: 'Bookings', value: data?.counts.bookings ?? '—', color: 'text-gold-light' },
    { icon: Users, label: 'Users', value: data?.counts.users ?? '—', color: 'text-blue-400' },
    { icon: CreditCard, label: 'Live Streams', value: data?.counts.liveStreams ?? '—', color: 'text-purple-400' },
  ]
  const revenueChart = data?.charts.revenue ?? []
  const bookingChart = data?.charts.bookings ?? []
  const updated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <>
      <Helmet><title>Admin Dashboard</title></Helmet>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-white/50">
            Live platform overview from MySQL. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-white/35">Updated {updated}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>
      {isError && <p className="mt-4 text-sm text-red-400">Could not load dashboard</p>}
      {isLoading && <p className="mt-4 text-sm text-white/40">Loading…</p>}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <s.icon className={`h-6 w-6 ${s.color}`} />
            <p className="mt-4 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-white/50">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Pending bookings" value={data?.counts.pendingBookings ?? '—'} />
        <MiniStat label="Confirmed bookings" value={data?.counts.confirmedBookings ?? '—'} />
        <MiniStat label="Total streams" value={data?.counts.streams ?? '—'} />
        <MiniStat label="Current viewers" value={data?.counts.currentViewers ?? '—'} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Revenue (recent)</CardTitle></CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart.length ? revenueChart : [{ month: '—', revenue: 0 }]}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A14A" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#C9A14A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" stroke="#ffffff40" fontSize={12} />
                <YAxis stroke="#ffffff40" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ background: '#111', border: '1px solid #ffffff15', borderRadius: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C9A14A" fill="url(#goldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bookings (recent)</CardTitle></CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingChart.length ? bookingChart : [{ month: '—', bookings: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" stroke="#ffffff40" fontSize={12} />
                <YAxis stroke="#ffffff40" fontSize={12} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #ffffff15', borderRadius: 12 }} />
                <Bar dataKey="bookings" fill="#C9A14A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Recent Bookings</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="p-3">ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Event</th>
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentBookings ?? []).map((b) => (
                <tr key={b.id} className="border-b border-white/5">
                  <td className="p-3 font-mono text-gold-light">{b.bookingCode}</td>
                  <td className="p-3">{b.user?.name ?? '—'}</td>
                  <td className="p-3">{b.eventTitle}</td>
                  <td className="p-3">{new Date(b.eventDate).toLocaleDateString('en-IN')}</td>
                  <td className="p-3">{formatCurrency(b.totalAmount)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={statusBadge(b.status)}>{b.status}</Badge>
                      <Badge variant={statusBadge(b.paymentStatus)}>{b.paymentStatus}</Badge>
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.recentBookings?.length && (
                <tr><td className="p-4 text-white/40" colSpan={6}>No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-xs tracking-wide text-white/40 uppercase">{label}</p>
      <p className="mt-2 font-display text-xl font-semibold text-white">{value}</p>
    </Card>
  )
}
