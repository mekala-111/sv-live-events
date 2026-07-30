import { Helmet } from 'react-helmet-async'
import { Download, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { recordings } from '@/data/dummy'

export default function DashboardRecordings() {
  return (
    <>
      <Helmet><title>Recordings</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Cloud Recordings</h1>
      <p className="mt-2 text-white/50">Download your event recordings before they expire</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {recordings.map((rec) => (
          <div key={rec.id} className="glass overflow-hidden rounded-3xl">
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#1a1508] to-[#111]">
              <Play className="h-16 w-16 text-gold/40" />
            </div>
            <div className="p-6">
              <h3 className="font-display text-lg font-semibold">{rec.title}</h3>
              <p className="mt-2 text-sm text-white/50">{rec.duration} · {rec.size} · Expires {rec.expires}</p>
              <div className="mt-4 flex gap-3">
                <Button size="sm"><Play className="h-4 w-4" /> Watch</Button>
                <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Download</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
