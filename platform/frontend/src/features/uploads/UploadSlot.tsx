import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { ImagePlus, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadSlotProps {
  label: string
  hint?: string
  value: string | null
  onChange: (url: string | null, file?: File | null) => void
}

export function UploadSlot({ label, hint, value, onChange }: UploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const readFile = (file: File) => {
    const url = URL.createObjectURL(file)
    onChange(url, file)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) readFile(file)
  }

  const onSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) readFile(file)
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        'group relative aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-white/10 bg-[#121212] transition',
        dragging && 'border-gold/60 bg-gold/5',
        value && 'border-solid border-white/10',
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {value ? (
        <img src={value} alt={label} className="h-full w-full object-cover" />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center"
        >
          <ImagePlus className="h-6 w-6 text-gold/70" />
          <span className="text-xs font-medium text-white/70">{label}</span>
          {hint && <span className="text-[10px] text-white/35">{hint}</span>}
        </button>
      )}

      {value && (
        <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
          <span className="truncate text-[11px] font-medium text-white">{label}</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-gold/20 hover:text-gold"
              aria-label={`Replace ${label}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange(null, null)}
              className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-red-500/20 hover:text-red-300"
              aria-label={`Delete ${label}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onSelect} />
    </motion.div>
  )
}
