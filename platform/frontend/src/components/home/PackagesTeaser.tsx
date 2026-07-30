import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { packages } from '@/data/dummy'
import { formatCurrency } from '@/lib/utils'

export function PackagesTeaser() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-widest text-gold uppercase">Packages</p>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Plans for Every <span className="text-gradient-gold">Scale</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-4">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 ${pkg.popular ? 'bg-gradient-gold text-[#090909] shadow-[0_0_60px_rgba(201,161,74,0.25)]' : 'glass'}`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#090909] px-4 py-1 text-xs font-medium text-gold-light">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-2xl font-bold">{pkg.name}</h3>
              <p className={`mt-2 text-sm ${pkg.popular ? 'text-[#090909]/70' : 'text-white/50'}`}>{pkg.description}</p>
              <p className="mt-6 font-display text-4xl font-bold">
                {pkg.custom ? 'Custom' : formatCurrency(pkg.price)}
              </p>
              <ul className="mt-6 space-y-3">
                {pkg.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${pkg.popular ? 'text-[#090909]' : 'text-gold'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/packages" className="mt-8 block">
                <Button variant={pkg.popular ? 'outline' : 'gold'} className="w-full" size="sm">
                  {pkg.custom ? 'Contact Sales' : 'View Details'}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
