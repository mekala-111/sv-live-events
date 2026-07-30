import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { packages } from '@/data/dummy'
import { formatCurrency } from '@/lib/utils'

const allFeatures = [
  '2 HD Cameras', '4 HD Cameras', '6–8 4K Cameras', 'Unlimited Cameras',
  'Single Platform Stream', 'Multi-Platform Simulcast', 'Drone + Crane Shots', 'OB Van Setup',
  '4 Hours Coverage', '8 Hours Coverage', '12 Hours Coverage', 'Multi-Day Events',
  'Cloud Recording 7 Days', 'Cloud Recording 30 Days', 'Unlimited Recording', 'API Integration',
  'Basic Chat', 'Moderated Chat + Reactions', 'Custom Branding', 'SLA Guarantee',
  '1 Technician', '2 Technicians', 'Dedicated Director', 'Account Manager',
  'Instant Replay', 'Same-Day Highlight Reel', 'White-Label Portal',
]

export default function PackagesPage() {
  return (
    <>
      <Helmet><title>Packages</title></Helmet>
      <div className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="text-sm tracking-widest text-gold uppercase">Pricing</p>
            <h1 className="mt-4 font-display text-5xl font-bold">
              Transparent <span className="text-gradient-gold">Packages</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-white/60">
              All packages include setup, encoding, CDN delivery, and technical support. Add-ons available for drone, extra cameras, and same-day edits.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 lg:grid-cols-4">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-3xl p-8 ${pkg.popular ? 'relative bg-gradient-gold text-[#090909] shadow-[0_0_80px_rgba(201,161,74,0.3)]' : 'glass'}`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#090909] px-4 py-1 text-xs text-gold-light">Most Popular</span>
                )}
                <h2 className="font-display text-2xl font-bold">{pkg.name}</h2>
                <p className={`mt-2 text-sm ${pkg.popular ? 'text-[#090909]/70' : 'text-white/50'}`}>{pkg.description}</p>
                <p className="mt-6 font-display text-4xl font-bold">
                  {pkg.custom ? 'Custom Quote' : formatCurrency(pkg.price)}
                </p>
                <ul className="mt-8 space-y-3">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${pkg.popular ? '' : 'text-gold'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={pkg.custom ? '/contact' : '/booking'} className="mt-8 block">
                  <Button variant={pkg.popular ? 'outline' : 'gold'} className="w-full">
                    {pkg.custom ? 'Contact Sales' : 'Book This Package'}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 overflow-x-auto">
            <h2 className="mb-8 font-display text-2xl font-bold">Feature Comparison</h2>
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="py-4 pr-4">Feature</th>
                  {packages.map((p) => (
                    <th key={p.id} className="px-4 py-4 font-display">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((feature) => (
                  <tr key={feature} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white/70">{feature}</td>
                    {packages.map((p) => (
                      <td key={p.id} className="px-4 py-3 text-center">
                        {p.features.includes(feature) ? (
                          <Check className="mx-auto h-4 w-4 text-gold" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-white/20" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
