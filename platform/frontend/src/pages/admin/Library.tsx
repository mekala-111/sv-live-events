import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Film, Search, Star } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

type Asset = {
  id: string
  title: string
  category?: string | null
  tags?: string | null
  collection?: string | null
  playlist?: string | null
  fileUrl: string
  thumbnail?: string | null
  durationSec: number
  playbackUrl?: string
}

export default function AdminLibrary() {
  const [q, setQ] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [meta, setMeta] = useState<{ categories: string[]; collections: string[]; playlists: string[] }>({
    categories: [],
    collections: [],
    playlists: [],
  })

  const load = async (query = q) => {
    const [list, playlists] = await Promise.all([
      api.get('/library', { params: { q: query || undefined } }),
      api.get('/library/playlists'),
    ])
    setAssets(list.data?.data || [])
    setMeta(playlists.data?.data || meta)
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [])

  const fav = async (id: string) => {
    await api.post(`/library/favourites/${id}`)
  }

  return (
    <>
      <Helmet><title>Content Library | Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold-light">VOD</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Content Library</h1>
          <p className="mt-2 text-white/50">Categories · tags · collections · playlists · favourites</p>
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            load()
          }}
        >
          <Input placeholder="Search title, tags, category…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button type="submit"><Search className="h-4 w-4" /></Button>
        </form>

        <div className="flex flex-wrap gap-2 text-xs text-white/45">
          {meta.categories.map((c) => (
            <button key={c} type="button" className="rounded-full bg-white/5 px-3 py-1" onClick={() => { setQ(c); load(c) }}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((a) => (
            <Card key={a.id} className="overflow-hidden p-0">
              {a.thumbnail ? (
                <img src={a.thumbnail} alt="" className="aspect-video w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-white/5 text-gold-light"><Film className="h-8 w-8" /></div>
              )}
              <div className="p-4">
                <h3 className="font-medium">{a.title}</h3>
                <p className="mt-1 text-xs text-white/45">
                  {a.category} · {Math.round(a.durationSec / 60)} min · {a.collection || '—'}
                </p>
                <div className="mt-3 flex gap-2">
                  <a href={a.playbackUrl || a.fileUrl} target="_blank" rel="noreferrer">
                    <Button variant="ghost" className="!px-3">Play</Button>
                  </a>
                  <Button variant="ghost" className="!px-3" onClick={() => fav(a.id)}><Star className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {assets.length === 0 ? (
          <Card className="p-8 text-center text-white/50">
            Library empty. End a stream, then use “Add to library” from recordings (API: POST /library/from-recording/:id).
          </Card>
        ) : null}
      </div>
    </>
  )
}
