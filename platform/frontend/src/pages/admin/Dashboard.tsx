import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Calendar, CreditCard, TrendingUp, Users } from 'lucide-react'
import { Badge, statusBadge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

type Dash = {
  counts: { users: number; bookings: number; pendingBookings: number; confirmedBookings: number }
  revenue: number
  recentBookings: {
    id: string
    bookingCode: string
    eventTitle: string
    eventDate: string
    totalAmount: number
    status: string
    user?: { name: string; email: string }
  }[]
}

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get<{ data: Dash }>('/admin/dashboard')).data.data,
  })

  const streamsQ = useQuery({
    queryKey: ['admin-stream-count'],
    queryFn: async () => (await api.get<{ data: unknown[] }>('/stream/events')).data.data.length,
  })

  const stats = [
    { icon: TrendingUp, label: 'Revenue (paid)', value: formatCurrency(data?.revenue ?? 0), color: 'text-emerald-400' },
    { icon: Calendar, label: 'Bookings', value: data?.counts.bookings ?? '—', color: 'text-gold-light' },
    { icon: Users, label: 'Users', value: data?.counts.users ?? '—', color: 'text-blue-400' },
    { icon: CreditCard, label: 'Live Streams', value: streamsQ.data ?? '—', color: 'text-purple-400' },
  ]

  const monthKey = (d: string) => {
    const dt = new Date(d)
    return dt.toLocaleString('en', { month: 'short' })
  }

  const bookingChart = (() => {
    const map: Record<string, number> = {}
    for (const b of data?.recentBookings ?? []) {
      const k = monthKey(b.eventDate)
      map[k] = (map[k] || 0) + 1
    }
    return Object.entries(map).map(([month, bookings]) => ({ month, bookings }))
  })()

  const revenueChart = (() => {
    const map: Record<string, number> = {}
    for (const b of data?.recentBookings ?? []) {
      const k = monthKey(b.eventDate)
      map[k] = (map[k] || 0) + b.totalAmount
    }
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }))
  })()

  return (
    <>
      <Helmet><title>Admin Dashboard</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-white/50">Platform overview and analytics</p>
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
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #ffffff15', borderRadius: 12 }} />
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
                  <td className="p-3">{new Date(b.eventDate).toLocaleDateString()}</td>
                  <td className="p-3">{formatCurrency(b.totalAmount)}</td>
                  <td className="p-3"><Badge variant={statusBadge(b.status)}>{b.status}</Badge></td>
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
