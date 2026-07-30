import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  disabled?: boolean
  id?: string
}

export function Toggle({ checked, onChange, label, disabled, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex cursor-pointer items-center gap-3 select-none',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-all duration-300',
          checked
            ? 'bg-gradient-to-r from-gold to-orange shadow-[var(--glow-gold)]'
            : 'bg-white/10',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300',
            checked && 'translate-x-5',
          )}
        />
      </button>
      {label && <span className="text-sm text-white/80">{label}</span>}
    </label>
  )
}
