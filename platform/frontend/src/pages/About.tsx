import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Award, Globe, Users, Video } from 'lucide-react'

const milestones = [
  { year: '2004', title: 'Founded in Hyderabad', desc: 'Started with single-camera wedding streams for local families.' },
  { year: '2012', title: 'Multi-City Expansion', desc: 'Opened operations in Bangalore, Chennai, Mumbai, and Delhi.' },
  { year: '2018', title: '4K & Drone Integration', desc: 'Upgraded entire fleet to 4K with certified drone operators.' },
  { year: '2024', title: '15,000 Events Milestone', desc: 'Crossed 15,000 live events with 99.9% uptime SLA.' },
]

export default function AboutPage() {
  return (
    <>
      <Helmet><title>About Us</title></Helmet>
      <div className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <p className="text-sm tracking-widest text-gold uppercase">About SV Live Events</p>
            <h1 className="mt-4 font-display text-5xl font-bold">
              Two Decades of <span className="text-gradient-gold">Broadcast Excellence</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/60">
              Since 2004, SV Live Events has been the trusted partner for families, temples, corporates, and institutions who need their most important moments shared with loved ones across the globe. What began as a single OB van in Hyderabad has grown into a nationwide network of certified streaming professionals.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Video, label: '15,000+ Events', sub: 'Streamed live' },
              { icon: Globe, label: '120+ Cities', sub: 'Across India & abroad' },
              { icon: Users, label: '85+ Crew', sub: 'Certified technicians' },
              { icon: Award, label: '99.9% Uptime', sub: 'Enterprise SLA' },
            ].map((item) => (
              <div key={item.label} className="glass rounded-3xl p-6 text-center">
                <item.icon className="mx-auto h-8 w-8 text-gold" />
                <p className="mt-4 font-display text-xl font-bold">{item.label}</p>
                <p className="text-sm text-white/50">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-20">
            <h2 className="font-display text-3xl font-bold">Our Journey</h2>
            <div className="mt-10 space-y-8 border-l border-gold/30 pl-8">
              {milestones.map((m) => (
                <div key={m.year} className="relative">
                  <span className="absolute -left-[2.4rem] flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-light">
                    {m.year.slice(2)}
                  </span>
                  <h3 className="font-display text-xl font-semibold">{m.title}</h3>
                  <p className="mt-2 text-white/60">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
