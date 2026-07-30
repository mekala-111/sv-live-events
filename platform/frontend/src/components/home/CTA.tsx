import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CTA() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gold/20 via-[#1a1508] to-[#090909] p-12 md:p-16"
        >
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl font-bold md:text-5xl">
                Ready to Go <span className="text-gradient-gold">Live?</span>
              </h2>
              <p className="mt-4 text-lg text-white/60">
                Book your event in minutes or speak with our production team for a custom quote. Same-day site surveys available in Hyderabad and major metros.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link to="/booking">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Booking <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="tel:9397364040">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Phone className="h-4 w-4" /> 9397364040
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
