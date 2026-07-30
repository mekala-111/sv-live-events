import type { ComponentType } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  Building2, Camera, Flower2, GraduationCap, Heart, Landmark, Lock, Megaphone, Music, Stethoscope, Trophy,
} from 'lucide-react'
import { services } from '@/data/dummy'

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Heart, Building2, Landmark, Stethoscope, GraduationCap, Trophy, Flower2, Megaphone, Music, Lock, Camera,
}

export default function ServicesPage() {
  return (
    <>
      <Helmet><title>Services</title></Helmet>
      <div className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <p className="text-sm tracking-widest text-gold uppercase">Services</p>
            <h1 className="mt-4 font-display text-5xl font-bold">
              End-to-End <span className="text-gradient-gold">Live Production</span>
            </h1>
            <p className="mt-6 text-lg text-white/60">
              From pre-event site surveys to post-event highlight reels — our teams handle camera placement, audio mixing, encoding, CDN delivery, and guest access management.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] ?? Camera
              return (
                <motion.article
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass group overflow-hidden rounded-3xl md:flex"
                >
                  <div className="relative h-56 shrink-0 md:h-auto md:w-72">
                    <img src={service.image} alt={service.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#090909]/80 md:bg-gradient-to-l" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold-light">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="font-display text-2xl font-semibold">{service.title}</h2>
                    <p className="mt-3 leading-relaxed text-white/60">{service.description}</p>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
