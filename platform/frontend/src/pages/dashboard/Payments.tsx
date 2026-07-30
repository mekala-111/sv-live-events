import { Helmet } from 'react-helmet-async'
import { CreditCard } from 'lucide-react'
import { Badge, statusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'

const payments = [
  { id: 'PAY-001', date: '2026-03-01', amount: 49999, method: 'UPI', status: 'Completed' },
  { id: 'PAY-002', date: '2026-02-15', amount: 89999, method: 'Bank Transfer', status: 'Completed' },
  { id: 'PAY-003', date: '2026-03-28', amount: 12499, method: 'Card', status: 'Pending' },
]

export default function DashboardPayments() {
  return (
    <>
      <Helmet><title>Payments</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Payment History</h1>
      <div className="mt-8 grid gap-4">
        {payments.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
                <CreditCard className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="font-mono text-sm text-gold-light">{p.id}</p>
                <p className="text-sm text-white/50">{formatDate(p.date)} · {p.method}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-display text-lg font-bold">{formatCurrency(p.amount)}</p>
              <Badge variant={statusBadge(p.status)}>{p.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
