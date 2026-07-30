import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  delay?: number
}

export function SectionCard({ title, description, action, children, className, delay = 0 }: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-2xl border border-white/[0.07] bg-[#161616]/90 p-5 shadow-[var(--shadow-luxury)] backdrop-blur-xl sm:p-6',
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight text-white sm:text-lg">{title}</h2>
          {description && <p className="mt-1 text-sm text-white/45">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  )
}
