import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  kind: ToastKind
  message: string
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, kind, message }])
    window.setTimeout(() => dismiss(id), 3200)
  }, [dismiss])

  const ToastHost = (
    <>
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-[min(100vw-2rem,360px)] flex-col gap-2">
            <AnimatePresence>
              {toasts.map((t) => {
                const Icon = icons[t.kind]
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 24 }}
                    className={cn(
                      'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[var(--shadow-luxury)] backdrop-blur-xl',
                      t.kind === 'success' && 'border-emerald-500/30 bg-[#161616]/95 text-emerald-300',
                      t.kind === 'error' && 'border-red-500/30 bg-[#161616]/95 text-red-300',
                      t.kind === 'info' && 'border-gold/30 bg-[#161616]/95 text-gold-light',
                    )}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="flex-1 text-sm text-white/90">{t.message}</p>
                    <button type="button" onClick={() => dismiss(t.id)} className="text-white/40 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </>
  )

  return { toast, ToastHost }
}
