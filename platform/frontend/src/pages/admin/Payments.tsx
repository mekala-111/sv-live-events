import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Badge, statusBadge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

type Payment = {
  id: string
  amount: number
  method?: string | null
  status: string
  createdAt: string
  booking?: {
    bookingCode: string
    user?: { name: string }
  }
}

export default function AdminPayments() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => (await api.get<{ data: Payment[] }>('/admin/payments')).data.data,
  })

  return (
    <>
      <Helmet><title>Payments</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Payment Management</h1>
      {isError && <p className="mt-4 text-sm text-red-400">Could not load payments</p>}
      <div className="glass mt-8 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Amount</th>
              <th className="p-4">Method</th><th className="p-4">Date</th><th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="p-4 text-white/40" colSpan={6}>Loading…</td></tr>}
            {data.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="p-4 font-mono text-gold-light">{p.booking?.bookingCode || p.id.slice(0, 8)}</td>
                <td className="p-4">{p.booking?.user?.name ?? '—'}</td>
                <td className="p-4">{formatCurrency(p.amount)}</td>
                <td className="p-4">{p.method || '—'}</td>
                <td className="p-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="p-4"><Badge variant={statusBadge(p.status)}>{p.status}</Badge></td>
              </tr>
            ))}
            {!isLoading && !data.length && (
              <tr><td className="p-4 text-white/40" colSpan={6}>No payments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
