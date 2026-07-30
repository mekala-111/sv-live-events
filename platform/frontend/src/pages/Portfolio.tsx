import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Eye, MapPin } from 'lucide-react'
import { portfolioItems } from '@/data/dummy'

export default function PortfolioPage() {
  return (
    <>
      <Helmet><title>Portfolio</title></Helmet>
      <div className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm tracking-widest text-gold uppercase">Portfolio</p>
            <h1 className="mt-4 font-display text-5xl font-bold">
              Our <span className="text-gradient-gold">Greatest Hits</span>
            </h1>
            <p className="mt-4 max-w-2xl text-white/60">
              15,000+ events streamed across weddings, temples, sports, and corporate stages. Each production tailored to venue, audience, and platform requirements.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group glass overflow-hidden rounded-3xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs text-gold-light">{item.category}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold">{item.title}</h3>
                  <div className="mt-3 flex items-center justify-between text-sm text-white/50">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{item.location}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{item.viewers}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
