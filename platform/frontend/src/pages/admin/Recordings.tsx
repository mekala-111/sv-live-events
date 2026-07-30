import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Download, Film, Link2, Trash2, Shield } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Recording {
  id: string
  title: string
  fileUrl: string
  previewUrl?: string | null
  thumbnail?: string | null
  durationSec: number
  fileSizeMb: number
  isPublic: boolean
  shareToken?: string | null
  expiresAt?: string | null
  passwordHash?: string | null
  trimStartSec?: number | null
  trimEndSec?: number | null
  stream?: { title: string; slug: string }
}

export default function AdminRecordings() {
  const [items, setItems] = useState<Recording[]>([])

  const load = async () => {
    const res = await api.get('/stream/recordings')
    setItems(res.data?.data || [])
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [])

  const togglePublic = async (id: string, isPublic: boolean) => {
    await api.patch(`/stream/recordings/${id}`, { isPublic: !isPublic })
    await load()
  }

  const setExpiry = async (id: string) => {
    const days = prompt('Expire after how many days? (blank = clear)', '30')
    if (days === null) return
    const expiresAt = days.trim()
      ? new Date(Date.now() + Number(days) * 86400000).toISOString()
      : null
    await api.patch(`/stream/recordings/${id}`, { expiresAt })
    await load()
  }

  const setPassword = async (id: string) => {
    const password = prompt('Recording password (min 4 chars, blank = remove)')
    if (password === null) return
    await api.patch(`/stream/recordings/${id}`, {
      password: password.trim() ? password : null,
    })
    await load()
  }

  const trim = async (id: string, durationSec: number) => {
    const start = Number(prompt('Trim start (seconds)', '0') || 0)
    const end = Number(prompt('Trim end (seconds)', String(durationSec)) || durationSec)
    await api.patch(`/stream/recordings/${id}`, { trimStartSec: start, trimEndSec: end })
    await load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete recording?')) return
    await api.delete(`/stream/recordings/${id}`)
    await load()
  }

  return (
    <>
      <Helmet><title>Recordings | Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold-light">Archive</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Stream Recordings</h1>
          <p className="mt-2 text-white/50">Share links, password protect, set expiry, and trim windows.</p>
        </div>
        <div className="grid gap-4">
          {items.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-start gap-3">
                {r.thumbnail ? (
                  <img src={r.thumbnail} alt="" className="h-14 w-20 rounded-xl object-cover" loading="lazy" />
                ) : (
                  <div className="rounded-xl bg-gold/15 p-3 text-gold-light"><Film className="h-5 w-5" /></div>
                )}
                <div>
                  <h3 className="font-medium">{r.title}</h3>
                  <p className="text-sm text-white/50">
                    {r.stream?.title} · {Math.round(r.durationSec / 60)} min · {r.fileSizeMb} MB
                  </p>
                  <p className="mt-1 text-xs text-white/35">
                    {r.isPublic ? `Public · ${r.shareToken}` : 'Private'}
                    {r.expiresAt ? ` · expires ${new Date(r.expiresAt).toLocaleDateString()}` : ''}
                    {r.passwordHash ? ' · password protected' : ''}
                    {r.trimStartSec != null ? ` · trim ${r.trimStartSec}s–${r.trimEndSec}s` : ''}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={r.previewUrl || r.fileUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost"><Download className="h-4 w-4" /></Button>
                </a>
                <Button variant="ghost" onClick={() => togglePublic(r.id, r.isPublic)} title="Share">
                  <Link2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setPassword(r.id)} title="Password">
                  <Shield className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setExpiry(r.id)}>Expiry</Button>
                <Button variant="ghost" onClick={() => trim(r.id, r.durationSec)}>Trim</Button>
                <Button variant="ghost" className="text-red-300" onClick={() => remove(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          {items.length === 0 ? (
            <Card className="p-8 text-center text-white/50">
              No recordings yet. End a live stream to auto-create one.
            </Card>
          ) : null}
        </div>
      </div>
    </>
  )
}
