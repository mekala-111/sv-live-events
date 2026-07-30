import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2, Camera, Flower2, GraduationCap, Heart, Landmark, Lock, Megaphone, Music, Stethoscope, Trophy,
} from 'lucide-react'
import { services } from '@/data/dummy'

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Heart, Building2, Landmark, Stethoscope, GraduationCap, Trophy, Flower2, Megaphone, Music, Lock, Camera,
}

export function Services() {
  return (
    <section className="section-padding relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-widest text-gold uppercase">Our Expertise</p>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Streaming for Every <span className="text-gradient-gold">Occasion</span>
          </h2>
          <p className="mt-4 text-white/60">
            Specialized production teams for weddings, temples, corporates, sports, and more — each event type gets tailored camera plans and platform strategy.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Camera
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8 }}
                className="group glass overflow-hidden rounded-3xl"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090909] to-transparent" />
                  <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold-light backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-white">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50 line-clamp-3">{service.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link to="/services" className="text-gold-light underline-offset-4 hover:underline">
            View all services →
          </Link>
        </div>
      </div>
    </section>
  )
}
