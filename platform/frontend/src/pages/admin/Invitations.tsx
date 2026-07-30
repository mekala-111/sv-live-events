import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { QRCodeSVG } from 'qrcode.react'
import { Mail, MessageCircle, Phone, Send, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

type Invite = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  channel: string
  status: string
  token: string
  qrPayload?: string | null
  link?: string
}

export default function AdminInvitations() {
  const [streams, setStreams] = useState<Array<{ id: string; title: string; slug: string }>>([])
  const [streamId, setStreamId] = useState('')
  const [invites, setInvites] = useState<Invite[]>([])
  const [form, setForm] = useState({ name: '', email: '', phone: '', channel: 'EMAIL' })
  const [created, setCreated] = useState<Invite[]>([])

  useEffect(() => {
    api.get('/stream/events').then((res) => {
      const list = res.data?.data || []
      setStreams(list)
      if (list[0]) setStreamId(list[0].id)
    })
  }, [])

  useEffect(() => {
    if (!streamId) return
    api.get(`/invites/stream/${streamId}`).then((res) => setInvites(res.data?.data || []))
  }, [streamId])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api.post('/invites', {
      streamId,
      guests: [
        {
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          channel: form.channel,
        },
      ],
    })
    setCreated(res.data.data)
    setForm({ name: '', email: '', phone: '', channel: 'EMAIL' })
    const list = await api.get(`/invites/stream/${streamId}`)
    setInvites(list.data?.data || [])
  }

  return (
    <>
      <Helmet><title>Guest Invitations | Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold-light">Guests</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Invitation System</h1>
          <p className="mt-2 text-white/50">Email · SMS · WhatsApp · secure links · QR tracking</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card className="p-5">
            <form onSubmit={send} className="space-y-4">
              <label className="block text-sm text-white/60">
                Event
                <select
                  className="mt-2 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white"
                  value={streamId}
                  onChange={(e) => setStreamId(e.target.value)}
                >
                  {streams.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#111]">{s.title}</option>
                  ))}
                </select>
              </label>
              <Input label="Guest name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <Input label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              <label className="block text-sm text-white/60">
                Channel
                <select
                  className="mt-2 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3"
                  value={form.channel}
                  onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
                >
                  <option value="EMAIL" className="bg-[#111]">Email</option>
                  <option value="SMS" className="bg-[#111]">SMS</option>
                  <option value="WHATSAPP" className="bg-[#111]">WhatsApp</option>
                </select>
              </label>
              <Button type="submit" className="w-full"><Send className="h-4 w-4" /> Send invite</Button>
            </form>
          </Card>

          <div className="space-y-4">
            {created.map((c) => (
              <Card key={c.id} className="flex flex-wrap items-center gap-4 p-5">
                {c.link || c.qrPayload ? (
                  <QRCodeSVG value={c.link || c.qrPayload || ''} size={96} bgColor="#090909" fgColor="#F7E6A3" />
                ) : null}
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="mt-1 break-all text-sm text-white/50">{c.link || c.qrPayload}</p>
                </div>
              </Card>
            ))}

            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2 text-gold-light"><Users className="h-4 w-4" /> Tracking</div>
              <div className="space-y-2">
                {invites.map((i) => (
                  <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{i.name}</p>
                      <p className="text-xs text-white/40 flex items-center gap-2">
                        {i.channel === 'EMAIL' ? <Mail className="h-3 w-3" /> : i.channel === 'SMS' ? <Phone className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                        {i.email || i.phone || '—'}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">{i.status}</span>
                  </div>
                ))}
                {invites.length === 0 ? <p className="text-white/40">No invitations yet.</p> : null}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
