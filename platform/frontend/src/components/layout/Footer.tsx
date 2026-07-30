import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { landingUrl } from '@/lib/landing'
import logo from '@/assets/Logo.png'

const footerLinks = {
  Services: [
    { href: landingUrl('/#services'), label: 'All Services', external: true },
    { to: '/packages', label: 'Packages' },
    { to: '/booking', label: 'Book Event' },
    { href: landingUrl('/#portfolio'), label: 'Portfolio', external: true },
  ],
  Company: [
    { href: landingUrl('/#about'), label: 'About Us', external: true },
    { href: landingUrl('/#blog'), label: 'Blog', external: true },
    { href: landingUrl('/#contact'), label: 'Contact', external: true },
    { to: '/login', label: 'Client Portal' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#060606]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <a href={landingUrl()} className="flex items-center gap-3">
              <img src={logo} alt="SV Live Events" className="h-12 w-auto" />
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Professional multi-camera live streaming solutions trusted by families, temples, and enterprises across 120+ cities worldwide since 2004.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-white">{title}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a href={link.href} className="text-sm text-white/50 transition hover:text-gold-light">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.to!} className="text-sm text-white/50 transition hover:text-gold-light">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-display font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-4 text-sm text-white/50">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href="tel:9397364040" className="hover:text-gold-light">9397364040</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href="mailto:svliveevents@gmail.com" className="hover:text-gold-light">svliveevents@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>Hyderabad, Telangana — Serving India & Worldwide</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-sm text-white/40 md:flex-row">
          <p>© {new Date().getFullYear()} SV Live Events. All rights reserved.</p>
          <p>Broadcast Every Moment. Anywhere in the World.</p>
        </div>
      </div>
    </footer>
  )
}
