import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-2">
      {label && (
          <label htmlFor={id} className="block text-xs font-medium tracking-wide text-white/50 uppercase">
            {label}
          </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white placeholder:text-white/30 transition-colors focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20',
          error && 'border-red-500/50',
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  ),
)
Input.displayName = 'Input'
