import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { stats } from '@/data/dummy'
import bgImage from '@/assets/bg.png'

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-gold/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

export function Hero() {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-animate', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
      })
    }, contentRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#090909]/70 via-[#090909]/85 to-[#090909]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,161,74,0.08)_0%,transparent_70%)]" />
      <Particles />

      <div ref={contentRef} className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8">
        <div className="hero-animate mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold-light">
          <Sparkles className="h-4 w-4" />
          Professional Multi Camera Live Streaming Solutions
        </div>

        <h1 className="hero-animate max-w-4xl font-display text-5xl leading-[1.1] font-bold tracking-tight md:text-6xl lg:text-7xl">
          Broadcast Every Moment.{' '}
          <span className="text-gradient-gold">Anywhere in the World.</span>
        </h1>

        <p className="hero-animate mt-6 max-w-2xl text-lg leading-relaxed text-white/60 md:text-xl">
          From sacred wedding rituals to global corporate summits — cinematic 4K multi-camera streams with private links, cloud recording, and 99.9% uptime across 120+ cities.
        </p>

        <div className="hero-animate mt-10 flex flex-wrap gap-4">
          <Link to="/booking">
            <Button size="lg">Book Now</Button>
          </Link>
          <Link to="/live/rahul-priya-wedding">
            <Button variant="outline" size="lg">
              <Play className="h-4 w-4" /> Watch Demo
            </Button>
          </Link>
        </div>

        <div className="hero-animate mt-20 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 text-center">
              <p className="font-display text-3xl font-bold text-gradient-gold md:text-4xl">{stat.value}</p>
              <p className="mt-2 text-sm text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
