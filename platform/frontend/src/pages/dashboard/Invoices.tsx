import { Helmet } from 'react-helmet-async'
import { Download } from 'lucide-react'
import { Badge, statusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { invoices } from '@/data/dummy'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DashboardInvoices() {
  return (
    <>
      <Helmet><title>Invoices</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Invoices</h1>
      <div className="mt-8 space-y-4">
        {invoices.map((inv) => (
          <div key={inv.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
            <div>
              <p className="font-mono text-gold-light">{inv.id}</p>
              <p className="mt-1 text-sm text-white/50">Booking {inv.booking} · {formatDate(inv.date)}</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-display text-xl font-bold">{formatCurrency(inv.amount)}</p>
              <Badge variant={statusBadge(inv.status)}>{inv.status}</Badge>
              <Button variant="outline" size="sm"><Download className="h-4 w-4" /> PDF</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
