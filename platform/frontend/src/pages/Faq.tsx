import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const faqs = [
  {
    q: 'How do guests watch a private wedding stream?',
    a: 'Share the viewer link and password. Guests open the link, enter the password, and receive a signed HLS playback session instantly.',
  },
  {
    q: 'What encoder should we use?',
    a: 'OBS Studio, vMix, or ATEM Mini Pro over RTMP. We provide the RTMP URL and stream key from the admin panel.',
  },
  {
    q: 'Can streams be recorded?',
    a: 'Yes. Every live event can auto-record. Admins can rename, share privately, or delete recordings from the Recordings panel.',
  },
  {
    q: 'Is chat moderated?',
    a: 'Realtime Socket.IO chat supports pinned messages, emoji reactions, mute, and admin delete/moderation controls.',
  },
  {
    q: 'Do you support 4K?',
    a: 'Yes — ingest up to 4K when bandwidth allows. Playback is adaptive HLS so guests on slower networks still watch smoothly.',
  },
]

export default function FaqPage() {
  return (
    <>
      <Helmet><title>FAQ | SV Live Events</title></Helmet>
      <div className="mx-auto max-w-3xl px-6 py-28">
        <p className="text-sm uppercase tracking-[0.25em] text-gold-light">FAQ</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Streaming questions, answered.</h1>
        <div className="mt-10 space-y-4">
          {faqs.map((item, i) => (
            <motion.details
              key={item.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass group rounded-2xl p-5"
            >
              <summary className="cursor-pointer list-none font-medium text-white">
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-7 text-white/60">{item.a}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </>
  )
}
