import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { portfolioItems } from '@/data/dummy'

export function Portfolio() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium tracking-widest text-gold uppercase">Portfolio</p>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              Events We&apos;ve <span className="text-gradient-gold">Broadcast</span>
            </h2>
          </div>
          <Link to="/portfolio" className="text-gold-light hover:underline">View full portfolio →</Link>
        </div>

        <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {portfolioItems.slice(0, 6).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group mb-6 break-inside-avoid overflow-hidden rounded-3xl"
            >
              <div className="relative">
                <img src={item.image} alt={item.title} className="w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition group-hover:opacity-100" />
                <div className="absolute right-0 bottom-0 left-0 p-6">
                  <span className="rounded-full bg-gold/20 px-3 py-1 text-xs text-gold-light">{item.category}</span>
                  <h3 className="mt-2 font-display text-xl font-semibold">{item.title}</h3>
                  <div className="mt-2 flex items-center gap-4 text-sm text-white/60">
                    <span>{item.location}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {item.viewers} viewers
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
