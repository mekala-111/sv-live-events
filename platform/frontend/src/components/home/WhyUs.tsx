import type { ComponentType } from 'react'
import { motion } from 'framer-motion'
import {
  Camera, Cloud, Globe, Headphones, Link, MessageCircle, Monitor, Plane, RotateCcw, Share2, Tv, Video,
} from 'lucide-react'
import { whyUsFeatures } from '@/data/dummy'

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Monitor, Camera, Plane, Link, Globe, Cloud, RotateCcw, MessageCircle, Youtube: Share2, Facebook: Tv, Video, Headphones,
}

export function WhyUs() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,161,74,0.06)_0%,transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium tracking-widest text-gold uppercase">Why Choose Us</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              Enterprise-Grade <span className="text-gradient-gold">Infrastructure</span>
            </h2>
            <p className="mt-4 text-lg text-white/60">
              We don&apos;t just point cameras — we engineer broadcast experiences with redundant uplinks, global CDN delivery, and a dedicated technical team on every event day.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <div className="glass rounded-2xl px-6 py-4">
                <p className="font-display text-2xl font-bold text-gold-light">99.9%</p>
                <p className="text-sm text-white/50">Uptime SLA</p>
              </div>
              <div className="glass rounded-2xl px-6 py-4">
                <p className="font-display text-2xl font-bold text-gold-light">24/7</p>
                <p className="text-sm text-white/50">Event Support</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {whyUsFeatures.map((feature, i) => {
              const Icon = iconMap[feature.icon] ?? Monitor
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="glass group rounded-2xl p-5 transition hover:border-gold/30"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-light transition group-hover:bg-gold/25">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-white/50">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
