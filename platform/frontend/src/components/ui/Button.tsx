import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        gold: 'bg-gradient-to-r from-gold to-orange text-[#080808] hover:shadow-[var(--glow-gold)] hover:scale-[1.02] active:scale-[0.98]',
        outline: 'border border-white/15 bg-transparent text-white hover:bg-white/5 hover:border-gold/40',
        ghost: 'bg-transparent text-white/80 hover:bg-white/5 hover:text-white',
        glass: 'glass text-white hover:bg-white/10',
        danger: 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-13 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'gold', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'
