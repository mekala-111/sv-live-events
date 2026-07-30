import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { landingUrl } from '@/lib/landing'
import logo from '@/assets/Logo.png'

const links = [
  { href: landingUrl('/#services'), label: 'Services', external: true },
  { href: landingUrl('/#portfolio'), label: 'Portfolio', external: true },
  { to: '/packages', label: 'Packages' },
  { href: landingUrl('/#about'), label: 'About', external: true },
  { to: '/faq', label: 'FAQ' },
  { href: landingUrl('/#blog'), label: 'Blog', external: true },
  { href: landingUrl('/#contact'), label: 'Contact', external: true },
  { to: '/booking', label: 'Book Event' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-500',
        scrolled ? 'glass-strong py-3 shadow-lg' : 'bg-transparent py-5',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <a href={landingUrl()} className="flex items-center gap-3">
          <img src={logo} alt="SV Live Events" className="h-10 w-auto object-contain" />
          <span className="hidden font-display text-lg font-semibold tracking-tight sm:block">
            SV Live Events
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) =>
            'external' in link && link.external ? (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-gold-light"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to!}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-gold-light',
                  location.pathname === link.to ? 'text-gold-light' : 'text-white/70',
                )}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/booking">
            <Button size="sm">Book Now</Button>
          </Link>
        </div>

        <button
          type="button"
          className="rounded-xl p-2 text-white lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-strong mx-4 mt-3 overflow-hidden rounded-2xl lg:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((link) =>
                'external' in link && link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="rounded-xl px-4 py-3 text-white/80 hover:bg-white/5"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to!}
                    className="rounded-xl px-4 py-3 text-white/80 hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <Link to="/login" className="rounded-xl px-4 py-3 text-white/80 hover:bg-white/5">
                Sign In
              </Link>
              <Link to="/booking" className="mt-2">
                <Button className="w-full">Book Now</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
