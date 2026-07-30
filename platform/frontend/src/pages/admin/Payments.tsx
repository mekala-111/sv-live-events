import { Helmet } from 'react-helmet-async'
import { Badge, statusBadge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

const payments = [
  { id: 'PAY-0891', customer: 'Amit Mehta', amount: 49999, method: 'UPI', date: '2026-03-01', status: 'Completed' },
  { id: 'PAY-0756', customer: 'TechVision Pvt Ltd', amount: 89999, method: 'Bank', date: '2026-02-15', status: 'Completed' },
  { id: 'PAY-0912', customer: 'Dr. Kavitha Nair', amount: 12499, method: 'Card', date: '2026-03-28', status: 'Pending' },
]

export default function AdminPayments() {
  return (
    <>
      <Helmet><title>Payments</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Payment Management</h1>
      <div className="glass mt-8 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Amount</th>
              <th className="p-4">Method</th><th className="p-4">Date</th><th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="p-4 font-mono text-gold-light">{p.id}</td>
                <td className="p-4">{p.customer}</td>
                <td className="p-4">{formatCurrency(p.amount)}</td>
                <td className="p-4">{p.method}</td>
                <td className="p-4">{p.date}</td>
                <td className="p-4"><Badge variant={statusBadge(p.status)}>{p.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
