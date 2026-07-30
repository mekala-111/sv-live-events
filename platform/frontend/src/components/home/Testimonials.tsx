import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { testimonials } from '@/data/dummy'

export function Testimonials() {
  return (
    <section className="section-padding bg-[#0c0c0c]/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-widest text-gold uppercase">Testimonials</p>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Trusted by <span className="text-gradient-gold">Thousands</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-3xl p-8"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="mt-4 text-lg leading-relaxed text-white/80">&ldquo;{t.content}&rdquo;</p>
              <footer className="mt-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold font-semibold text-[#090909]">
                  {t.avatar}
                </div>
                <div>
                  <cite className="not-italic font-semibold text-white">{t.name}</cite>
                  <p className="text-sm text-white/50">{t.role}</p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
