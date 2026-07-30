import { Helmet } from 'react-helmet-async'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Calendar, CreditCard, TrendingUp, Users } from 'lucide-react'
import { Badge, statusBadge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { adminBookings, adminStats } from '@/data/dummy'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboard() {
  return (
    <>
      <Helmet><title>Admin Dashboard</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-white/50">Platform overview and analytics</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: TrendingUp, label: 'Revenue (MTD)', value: formatCurrency(adminStats.revenue), color: 'text-emerald-400' },
          { icon: Calendar, label: 'Bookings', value: adminStats.bookings, color: 'text-gold-light' },
          { icon: Users, label: 'Customers', value: adminStats.customers, color: 'text-blue-400' },
          { icon: CreditCard, label: 'Live Streams', value: adminStats.streams, color: 'text-purple-400' },
        ].map((s) => (
          <Card key={s.label}>
            <s.icon className={`h-6 w-6 ${s.color}`} />
            <p className="mt-4 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-white/50">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adminStats.revenueChart}>
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
          <CardHeader><CardTitle>Bookings by Month</CardTitle></CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminStats.bookingsChart}>
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
              {adminBookings.map((b) => (
                <tr key={b.id} className="border-b border-white/5">
                  <td className="p-3 font-mono text-gold-light">{b.id}</td>
                  <td className="p-3">{b.customer}</td>
                  <td className="p-3">{b.event}</td>
                  <td className="p-3">{b.date}</td>
                  <td className="p-3">{formatCurrency(b.amount)}</td>
                  <td className="p-3"><Badge variant={statusBadge(b.status)}>{b.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
