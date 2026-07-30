import { Helmet } from 'react-helmet-async'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

type Item = {
  id: string
  title: string
  category: string
  mediaUrl: string
  thumbnail?: string | null
}

export default function AdminGallery() {
  const qc = useQueryClient()
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: async () => (await api.get<{ data: Item[] }>('/gallery')).data.data,
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/gallery/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-gallery'] }),
  })

  return (
    <>
      <Helmet><title>Gallery</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Gallery Management</h1>
        <Button disabled title="POST /gallery">Upload Media</Button>
      </div>
      {isError && <p className="mt-4 text-sm text-red-400">Could not load gallery</p>}
      {isLoading && <p className="mt-4 text-sm text-white/40">Loading…</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-2xl">
            <img src={item.thumbnail || item.mediaUrl} alt={item.title} className="aspect-square w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 p-4 opacity-0 transition group-hover:opacity-100">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-white/60">{item.category}</p>
              <div className="mt-2">
                <Button variant="danger" size="sm" onClick={() => remove.mutate(item.id)} disabled={remove.isPending}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && !data.length && <p className="text-white/40">No gallery items yet</p>}
      </div>
    </>
  )
}
