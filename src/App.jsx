import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './App.css'

gsap.registerPlugin(useGSAP)

const navItems = ['Home', 'Services', 'Portfolio', 'About', 'Clients', 'Gallery', 'Contact']

const services = [
  {
    title: 'Photography',
    items: ['Wedding Photography', 'Corporate Photography', 'Product Photography'],
  },
  {
    title: 'Live Streaming',
    items: ['Multi Camera Live Streaming', 'YouTube Live', 'Facebook Live', 'Instagram Live'],
  },
  {
    title: 'Drone Services',
    items: ['4K Drone Coverage', 'Aerial Photography', 'Aerial Cinematography'],
  },
  {
    title: 'LED Screens',
    items: ['Indoor LED Wall', 'Outdoor LED Wall', 'Rental'],
  },
  {
    title: 'Visual Jockey',
    items: ['Stage Visuals', 'Live Concert Visuals', 'Corporate Presentations'],
  },
  {
    title: 'Videography',
    items: ['Wedding Films', 'Corporate Films', 'Commercial Shoots', 'Political Events'],
  },
]

const counters = [
  { label: 'Events Covered', value: 1500, suffix: '+' },
  { label: 'Happy Clients', value: 500, suffix: '+' },
  { label: 'Years Experience', value: 10, suffix: '+' },
  { label: 'Customer Satisfaction', value: 100, suffix: '%' },
  { label: 'Support', value: 24, suffix: '/7' },
]

const portfolioItems = [
  { title: 'Wedding', image: '/assets/hero-1.png' },
  { title: 'Corporate', image: '/assets/hero-2.png' },
  { title: 'Concert', image: '/assets/poster-1.png' },
  { title: 'Drone', image: '/assets/poster-2.png' },
  { title: 'LED', image: '/assets/hero-2.png' },
  { title: 'Live Streaming', image: '/assets/hero-1.png' },
  { title: 'Political', image: '/assets/poster-1.png' },
  { title: 'Exhibitions', image: '/assets/poster-2.png' },
]

const testimonials = [
  {
    name: 'Ravi Teja',
    role: 'Wedding Client',
    text: 'Their visuals, live streaming setup, and team coordination were world-class. Every moment looked cinematic.',
  },
  {
    name: 'Madhavi Rao',
    role: 'Corporate Event Manager',
    text: 'SV Live Events handled LED wall production and broadcast flawlessly. Premium quality with absolute reliability.',
  },
  {
    name: 'Aditya Varma',
    role: 'Concert Organizer',
    text: 'The drone and VJ team transformed our stage into a spectacle. Audience engagement was beyond expectations.',
  },
]

function AnimatedCounter({ value, suffix, label }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame
    let startTime
    const duration = 1400

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setDisplay(Math.floor(progress * value))
      if (progress < 1) frame = window.requestAnimationFrame(step)
    }

    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [value])

  return (
    <div className="counter-box">
      <h3>
        {display}
        {suffix}
      </h3>
      <p>{label}</p>
    </div>
  )
}

function App() {
  const pageRef = useRef(null)
  const heroVisualRef = useRef(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [])

  useGSAP(
    () => {
      gsap.from('.reveal', {
        y: 40,
        autoAlpha: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
      })

      gsap.to('.floating-chip', {
        y: -12,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.2,
      })

      gsap.to('.hero-glow', {
        backgroundPosition: '200% 50%',
        duration: 10,
        repeat: -1,
        ease: 'none',
      })

      gsap.to('.parallax-layer', {
        y: -60,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.globalTimeline.timeScale(100)
      })
      return () => mm.revert()
    },
    { scope: pageRef }
  )

  const handleMouseMove = (event) => {
    if (!heroVisualRef.current) return
    const rect = heroVisualRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -14
    heroVisualRef.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg)`
  }

  return (
    <div className="site" ref={pageRef}>
      <div className="spotlight" />
      <div className="spotlight spotlight--two" />
      <header className="navbar">
        <div className="logo">SV LIVE EVENTS</div>
        <nav>
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
        </nav>
        <a href="#contact" className="book-btn magnetic">
          Book Now
        </a>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-left reveal">
            <p className="kicker">WE CAPTURE • WE CREATE • WE DELIVER</p>
            <h1>
              CAPTURING MOMENTS.
              <br />
              CREATING EXPERIENCES.
            </h1>
            <p className="service-list">
              Professional Photography • Live Streaming • Drone Services • LED Wall Solutions •
              Visual Jockey • Event Production
            </p>
            <p className="description">
              SV Live Events delivers premium event production services with cutting-edge technology,
              experienced professionals, and unforgettable visual experiences.
            </p>
            <div className="cta-group">
              <a href="#contact" className="primary-btn magnetic">
                Book Your Event
              </a>
              <a href="#portfolio" className="secondary-btn">
                View Portfolio
              </a>
            </div>
          </div>
          <motion.div
            className="hero-right reveal"
            ref={heroVisualRef}
            onMouseMove={handleMouseMove}
            transition={{ type: 'spring', stiffness: 80 }}
          >
            <div className="hero-glow">
              <img src="/assets/hero-2.png" alt="SV Live Events cinematic services collage" />
              <div className="floating-chip">Photography</div>
              <div className="floating-chip">Live Streaming</div>
              <div className="floating-chip">Drone</div>
              <div className="floating-chip">LED Screens</div>
              <div className="floating-chip">Visual Jockey</div>
            </div>
          </motion.div>
        </section>

        <section className="services reveal" id="services">
          <h2>Luxury Production Services</h2>
          <div className="service-grid">
            {services.map((service) => (
              <article className="glass-card" key={service.title}>
                <h3>{service.title}</h3>
                <ul>
                  {service.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="featured reveal">
          <h2>Featured Experiences</h2>
          <div className="featured-stack">
            <div className="feature-card">
              <img src="/assets/poster-1.png" alt="LED and VJ stage production" />
              <div>
                <h3>Cinematic LED & VJ Stage Design</h3>
                <p>Immersive LED walls, synchronized visuals, laser effects, and dynamic stage flow.</p>
              </div>
            </div>
            <div className="feature-card">
              <img src="/assets/poster-2.png" alt="Live streaming and drone production setup" />
              <div>
                <h3>Broadcast Live Streaming + Drone Cinematography</h3>
                <p>Multi-camera switching, crisp aerials, and premium live delivery for every scale.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="stats reveal" id="about">
          <h2>Why Choose SV Live Events</h2>
          <div className="stats-grid">
            {counters.map((counter) => (
              <AnimatedCounter key={counter.label} {...counter} />
            ))}
          </div>
        </section>

        <section className="portfolio reveal" id="portfolio">
          <h2>Cinematic Portfolio</h2>
          <div className="categories">
            {['Wedding', 'Corporate', 'Concert', 'Drone', 'LED', 'Live Streaming', 'Political', 'Exhibitions'].map(
              (cat) => (
                <span key={cat}>{cat}</span>
              )
            )}
          </div>
          <div className="masonry">
            {portfolioItems.map((item, index) => (
              <button
                key={`${item.title}-${index}`}
                className="masonry-item"
                onClick={() => setSelectedImage(item.image)}
                type="button"
              >
                <img src={item.image} alt={`${item.title} event by SV Live Events`} />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="process reveal">
          <h2>Our Process</h2>
          <div className="timeline">
            {['Consultation', 'Planning', 'Production', 'Editing', 'Final Delivery'].map((step) => (
              <div key={step} className="timeline-step">
                <span>{step}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="testimonials reveal" id="clients">
          <h2>Client Testimonials</h2>
          <div className="testimonial-card">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <p>"{testimonials[activeSlide].text}"</p>
              <h3>{testimonials[activeSlide].name}</h3>
              <span>{testimonials[activeSlide].role}</span>
              <div className="stars">★★★★★</div>
            </motion.div>
          </div>
        </section>

        <section className="cta reveal">
          <h2>Ready to Make Your Event Extraordinary?</h2>
          <p>Big Screens. Better Visuals. Unforgettable Events.</p>
          <a className="primary-btn magnetic" href="#contact">
            Book SV Live Events Today
          </a>
        </section>

        <section className="contact reveal" id="contact">
          <h2>Contact</h2>
          <div className="contact-grid">
            <div className="glass-card">
              <h3>Suman Narsing</h3>
              <p>Owner, SV LIVE EVENTS</p>
              <a href="tel:9397364040">9397364040</a>
              <a href="mailto:svliveevents@gmail.com">svliveevents@gmail.com</a>
            </div>
            <div className="glass-card">
              <h3>Connect</h3>
              <p>WhatsApp • Instagram • Facebook • YouTube • Google Maps</p>
              <p>Available Anywhere</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="gallery">
        <div>
          <h3>SV LIVE EVENTS</h3>
          <p>WE CAPTURE • WE CREATE • WE DELIVER</p>
        </div>
        <div>
          <a href="#services">Services</a>
          <a href="#portfolio">Gallery</a>
          <a href="#contact">Contact</a>
        </div>
        <p>© {new Date().getFullYear()} SV LIVE EVENTS. All rights reserved.</p>
      </footer>

      {selectedImage && (
        <button className="lightbox" onClick={() => setSelectedImage(null)} type="button">
          <motion.img
            src={selectedImage}
            alt="Portfolio fullscreen view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          />
        </button>
      )}

      <div className="parallax-layer" />
      <div className="particles">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            style={{
              '--x': `${Math.random() * 100}%`,
              '--delay': `${Math.random() * 5}s`,
              '--duration': `${8 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default App
