import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'

type Poll = {
  id: string
  question: string
  options: string[]
  tallies: number[]
  isOpen: boolean
}

const GIFTS = [
  { code: 'flower', label: '🌸 Flower', amount: 49 },
  { code: 'heart', label: '💖 Heart', amount: 99 },
  { code: 'crown', label: '👑 Crown', amount: 499 },
]

interface Props {
  slug: string
  sender: string
  playbackToken?: string
}

export function EngagePanel({ slug, sender, playbackToken }: Props) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [burst, setBurst] = useState<string[]>([])
  const [audioTracks, setAudioTracks] = useState<Array<{ id: string; language: string; label: string }>>([])
  const [audioLang, setAudioLang] = useState('original')

  const load = async () => {
    const [p, a] = await Promise.all([
      api.get(`/engage/${slug}/polls`),
      api.get(`/engage/${slug}/audio-tracks`),
    ])
    setPolls(p.data?.data || [])
    setAudioTracks(a.data?.data || [])
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [slug])

  const react = async (emoji: string) => {
    await api.post(`/engage/${slug}/react`, { emoji, sender })
    setBurst((b) => [...b, emoji])
    window.setTimeout(() => setBurst((b) => b.slice(1)), 1200)
  }

  const vote = async (pollId: string, optionIdx: number) => {
    await api.post(`/engage/polls/${pollId}/vote`, { optionIdx, voterKey: sender })
    await load()
  }

  const gift = async (giftCode: string, amountInr: number) => {
    await api.post(`/engage/${slug}/gift`, { sender, giftCode, amountInr, playbackToken })
    setBurst((b) => [...b, '🎁'])
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wider text-white/40">Reactions</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {['👏', '❤️', '🔥', '🎉', '🙏'].map((e) => (
            <button key={e} type="button" className="rounded-full bg-black/30 px-3 py-1 text-lg" onClick={() => react(e)}>
              {e}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center gap-2 pb-2">
          {burst.map((e, i) => (
            <span key={`${e}-${i}`} className="animate-bounce text-2xl opacity-80">{e}</span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wider text-white/40">Virtual gifts</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GIFTS.map((g) => (
            <Button key={g.code} variant="ghost" className="!px-3 text-sm" onClick={() => gift(g.code, g.amount)}>
              {g.label} ₹{g.amount}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wider text-white/40">Audio language</p>
        <select
          className="mt-2 w-full rounded-full border border-white/10 bg-black/30 px-3 py-2 text-sm"
          value={audioLang}
          onChange={(e) => setAudioLang(e.target.value)}
        >
          {audioTracks.map((t) => (
            <option key={t.id} value={t.language} className="bg-[#111]">{t.label}</option>
          ))}
        </select>
      </div>

      {polls.filter((p) => p.isOpen).map((p) => (
        <div key={p.id} className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
          <p className="text-sm font-medium">{p.question}</p>
          <div className="mt-3 space-y-2">
            {p.options.map((opt, i) => (
              <button
                key={opt}
                type="button"
                className="flex w-full items-center justify-between rounded-xl bg-black/30 px-3 py-2 text-left text-sm hover:bg-black/50"
                onClick={() => vote(p.id, i)}
              >
                <span>{opt}</span>
                <span className="text-gold-light">{p.tallies[i] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
