import { Helmet } from 'react-helmet-async'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

type Item = {
  id: string
  name: string
  role: string
  content: string
  rating?: number | null
}

export default function AdminTestimonials() {
  const qc = useQueryClient()
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => (await api.get<{ data: Item[] }>('/testimonials')).data.data,
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/testimonials/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-testimonials'] }),
  })

  return (
    <>
      <Helmet><title>Testimonials</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Testimonials</h1>
        <Button disabled title="POST /testimonials">Add Testimonial</Button>
      </div>
      {isError && <p className="mt-4 text-sm text-red-400">Could not load testimonials</p>}
      {isLoading && <p className="mt-4 text-sm text-white/40">Loading…</p>}
      <div className="mt-8 space-y-4">
        {data.map((t) => (
          <div key={t.id} className="glass flex flex-wrap items-start justify-between gap-4 rounded-2xl p-6">
            <div>
              <div className="flex gap-1">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="mt-3 max-w-2xl text-white/80">&ldquo;{t.content}&rdquo;</p>
              <p className="mt-3 font-medium">{t.name} · {t.role}</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => remove.mutate(t.id)} disabled={remove.isPending}>
              Remove
            </Button>
          </div>
        ))}
        {!isLoading && !data.length && <p className="text-white/40">No testimonials yet</p>}
      </div>
    </>
  )
}
