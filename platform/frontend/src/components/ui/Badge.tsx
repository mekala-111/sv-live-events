import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-white/10 text-white/80',
        gold: 'bg-gold/20 text-gold-light',
        success: 'bg-emerald-500/20 text-emerald-300',
        warning: 'bg-amber-500/20 text-amber-300',
        danger: 'bg-red-500/20 text-red-300',
        info: 'bg-blue-500/20 text-blue-300',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export function statusBadge(status: string) {
  const key = status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const map: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
    Confirmed: 'success',
    Completed: 'info',
    Pending: 'warning',
    Paid: 'success',
    Partial: 'warning',
    'In Progress': 'gold',
    Cancelled: 'danger',
  }
  return map[key] ?? 'default'
}
