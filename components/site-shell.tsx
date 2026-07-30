"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import logo from "@/src/assets/logo-sm.png";
import portfolioBg from "@/src/assets/Portfolio.png";
import { Hero } from "@/components/hero/Hero";
import { AboutSection } from "@/components/about/AboutSection";
import { ServicesSection } from "@/components/services/ServicesSection";
import { WhyChooseUsSection } from "@/components/why-choose-us/WhyChooseUsSection";
import { ProcessSection } from "@/components/process/ProcessSection";
import { PackagesSection } from "@/components/packages/PackagesSection";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { BlogSection } from "@/components/blog/BlogSection";
import { BookNowSection } from "@/components/book-now/BookNowSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { FooterSection } from "@/components/footer/FooterSection";
import { LoginModal } from "@/components/auth/LoginModal";
import { AnimatePresence, motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  Heart,
  Menu,
  MoveRight,
  PhoneCall,
  X,
} from "lucide-react";
import { useSite } from "@/src/hooks/useSite";
import { resolveIcon } from "@/src/lib/icons";
import { platformUrl } from "@/lib/platform";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type PortfolioItem = {
  id?: string;
  title: string;
  category: string;
  image: string;
  description: string;
};

function BrandLockup({ compact = false }: { compact?: boolean }) {
  const { site } = useSite();
  return (
    <div className={`inline-flex items-center ${compact ? "gap-2.5" : "gap-3.5"}`}>
      <div
        className={`relative overflow-hidden rounded-full border border-[#fdb515]/35 bg-black/70 p-1 shadow-[0_0_24px_rgba(253,181,21,0.18)] ${
          compact ? "h-11 w-11" : "h-14 w-14"
        }`}
      >
        <Image
          src={logo}
          alt={`${site.companyName} brand logo`}
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>
      <div>
        <p
          className={`font-heading font-bold tracking-[0.18em] text-white ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {site.companyNameHtml.prefix}
          <span className="text-[#fdb515]">{site.companyNameHtml.highlight}</span>
          {site.companyNameHtml.suffix}
        </p>
        {!compact ? (
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-white/45">
            {site.tagline}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function SiteShell() {
  const {
    site,
    portfolio,
  } = useSite();

  const navItems = site.nav;
  const portfolioItems = portfolio.items;
  const portfolioFilters = portfolio.filters;

  const pageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef(false);
  const [activeFilter, setActiveFilter] = useState(portfolio.filters[0] ?? "All Works");
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const filteredPortfolio = useMemo(() => {
    if (activeFilter === portfolio.filters[0] || activeFilter === "All Works") {
      return portfolioItems;
    }
    return portfolioItems.filter((item) => item.category === activeFilter);
  }, [activeFilter, portfolioItems, portfolio.filters]);

  const sectionIds = useMemo(
    () => navItems.map((item) => item.toLowerCase().replaceAll(" ", "-")),
    [navItems],
  );

  const portfolioStats = portfolio.stats.map((stat) => ({
    ...stat,
    icon: resolveIcon(stat.icon),
  }));

  const portfolioFeatures = portfolio.features.map((feature) => ({
    ...feature,
    icon: resolveIcon(feature.icon),
  }));

  useEffect(() => {
    const openLogin = () => setLoginOpen(true);
    window.addEventListener("sv:open-login", openLogin);

    const onHash = () => {
      if (window.location.hash === "#login") setLoginOpen(true);
    };
    onHash();
    window.addEventListener("hashchange", onHash);

    return () => {
      window.removeEventListener("sv:open-login", openLogin);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 750);

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${ratio})`;
      }
      const next = window.scrollY > 18;
      if (next !== scrolledRef.current) {
        scrolledRef.current = next;
        setScrolled(next);
      }

      const offset = window.scrollY + 120;
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= offset) current = id;
      }
      setActiveSection((prev) => (prev === current ? prev : current));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [sectionIds]);

  useGSAP(
    () => {
      const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      reveals.forEach((item) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              once: true,
            },
          },
        );
      });
    },
    { scope: pageRef },
  );

  return (
    <div ref={pageRef} className="relative overflow-x-clip bg-background text-foreground">
      <AnimatePresence>
        {!loaded ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <motion.div
              className="relative h-44 w-44 sm:h-52 sm:w-52"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <Image
                src={logo}
                alt="SV Live Events"
                fill
                className="object-contain"
                sizes="208px"
                priority
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed left-0 top-0 z-[70] h-1 w-full bg-white/5">
        <div
          ref={progressRef}
          className="h-full origin-left bg-gradient-to-r from-primary via-secondary to-amber-200"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(255,107,0,0.16),transparent_18%),radial-gradient(circle_at_80%_16%,rgba(255,149,0,0.16),transparent_14%),radial-gradient(circle_at_50%_100%,rgba(255,107,0,0.1),transparent_28%)]" />

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-black/90 shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-8">
          <a href="#home" className="font-heading text-lg font-bold tracking-[0.28em] text-white">
            <BrandLockup compact />
          </a>

          <nav className="hidden items-center gap-7 text-sm text-white/70 xl:flex">
            {navItems.map((item) => {
              const id = item.toLowerCase().replaceAll(" ", "-");
              const isActive = activeSection === id;
              return (
                <a
                  key={item}
                  href={`#${id}`}
                  className={`transition hover:text-white ${isActive ? "nav-link-active" : ""}`}
                >
                  {item}
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <button
              type="button"
              onClick={() => {
                window.location.href = platformUrl("/login");
              }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:text-white"
            >
              Sign In
            </button>
            <a
              href={platformUrl("/booking")}
              className="inline-flex items-center gap-2 rounded-full border border-[#fdb515]/55 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(253,181,21,0.18)] transition hover:-translate-y-0.5 hover:border-[#fdb515] hover:shadow-[0_0_34px_rgba(255,138,0,0.35)]"
            >
              Book Now
              <ArrowUpRight className="h-4 w-4 text-[#fdb515]" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-full border border-white/10 p-3 xl:hidden"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/10 bg-black/85 xl:hidden"
            >
              <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-5 md:px-8">
                {navItems.map((item) => {
                  const id = item.toLowerCase().replaceAll(" ", "-");
                  return (
                    <a
                      key={item}
                      href={`#${id}`}
                      onClick={() => setMenuOpen(false)}
                      className={`transition hover:text-white ${
                        activeSection === id ? "text-white" : "text-white/80"
                      }`}
                    >
                      {item}
                    </a>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    window.location.href = platformUrl("/login");
                  }}
                  className="pt-2 text-left text-white/80 transition hover:text-white"
                >
                  Sign In
                </button>
                <a
                  href={platformUrl("/booking")}
                  onClick={() => setMenuOpen(false)}
                  className="font-semibold text-[#fdb515] transition hover:text-white"
                >
                  Book Now
                </a>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main className="relative">
        <Hero />

        <AboutSection />

        <ServicesSection />

        <section id="portfolio" className="relative isolate overflow-x-clip">
          <div className="relative overflow-x-clip px-0">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
              <Image
                src={portfolioBg}
                alt=""
                fill
                priority={false}
                className="object-cover object-[65%_center] scale-[1.02]"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/55 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(107,33,168,0.26),transparent_42%),radial-gradient(circle_at_20%_55%,rgba(255,138,0,0.16),transparent_44%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-[#050505]/40" />
            </div>

            <div className="relative z-10 mx-auto max-w-[1400px] px-5 py-24 md:px-8">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                <div data-reveal className="max-w-3xl">
                  <div className="mb-4 flex items-center gap-4">
                    <span className="h-px w-14 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                    <p className="text-sm uppercase tracking-[0.3em] text-primary">{portfolio.label}</p>
                    <span className="h-px w-14 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                  </div>
                  <h2 className="font-heading text-[2.55rem] font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-[3.9rem] lg:text-[4.2rem]">
                    {portfolio.heading}{" "}
                    <span className="hero-gold-text inline-block">{portfolio.headingHighlight}</span>.
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 md:text-[15px] md:leading-8">
                    {portfolio.description}
                  </p>
                </div>

                <div data-reveal className="w-full lg:max-w-[560px]">
                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    {portfolioFilters.map((filter) => {
                      const isActive = activeFilter === filter;
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setActiveFilter(filter)}
                          className={`rounded-full border px-5 py-2 text-sm transition backdrop-blur-md ${
                            isActive
                              ? "border-[#FDB515]/60 bg-gradient-to-r from-[#FDB515]/20 to-[#FF8A00]/18 text-white shadow-[0_0_38px_rgba(253,181,21,0.18)]"
                              : "border-white/10 bg-white/[0.05] text-white/75 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live stats */}
                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {portfolioStats.map(({ value, suffix, label, icon: StatIcon, tone }) => (
                      <div
                        key={label}
                        className="glass-panel rounded-[24px] border border-white/10 px-5 py-4 backdrop-blur-md"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                              tone === "purple"
                                ? "border-purple-400/30 bg-purple-500/10 text-purple-300"
                                : "border-[#fdb515]/30 bg-[#ff8a00]/10 text-[#fdb515]"
                            }`}
                          >
                            <StatIcon className="h-5 w-5" strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-heading text-2xl font-bold text-white">
                              {value}
                              <span
                                className={`${
                                  tone === "purple" ? "text-purple-300" : "text-[#fdb515]"
                                }`}
                              >
                                {suffix}
                              </span>
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/55">
                              {label}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Masonry grid */}
              <div data-reveal className="mt-14">
                <div className="columns-1 [column-gap:24px] sm:columns-2 xl:columns-3">
                  {filteredPortfolio.map((item) => (
                    <div
                      key={`${item.title}-${item.category}`}
                      onClick={() => setSelectedImage(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setSelectedImage(item);
                      }}
                      className="mb-6 break-inside-avoid group relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-0 text-left shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-[#FDB515]/25"
                    >
                      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative h-[220px] sm:h-[260px]">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        <div className="absolute left-4 top-4 z-10">
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/35 px-4 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80">
                            {item.category}
                          </span>
                        </div>

                        <button
                          type="button"
                          aria-label={`Favorite ${item.title}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="absolute right-14 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/35 text-white/75 backdrop-blur-md transition hover:border-[#FDB515]/35 hover:text-[#FDB515]"
                        >
                          <Heart className="h-5 w-5" strokeWidth={1.75} />
                        </button>

                        <div className="absolute right-4 top-4 z-10">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/35 text-white/80 backdrop-blur-md transition hover:border-[#FDB515]/35 hover:text-[#FDB515]">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>

                      <div className="relative p-5">
                        <h3 className="font-heading text-xl font-semibold tracking-wide text-white">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-white/65">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom premium feature bar */}
              <div data-reveal className="mt-16 rounded-[30px] border border-white/10 bg-white/[0.03] px-5 py-6 backdrop-blur-xl shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {portfolioFeatures.map(({ icon: FeatureIcon, title, desc, tone }) => (
                    <div
                      key={title}
                      className="group relative rounded-[24px] border border-white/10 bg-black/20 p-5 transition hover:-translate-y-1 hover:border-[#FDB515]/25"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                          tone === "purple"
                            ? "border-purple-400/30 bg-purple-500/10 text-purple-300"
                            : "border-[#fdb515]/30 bg-[#ff8a00]/10 text-[#fdb515]"
                        }`}
                      >
                        <FeatureIcon className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <h4 className="mt-4 font-heading text-[16px] font-semibold text-white">
                        {title}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-white/62">{desc}</p>
                      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-gradient-to-br from-[#FDB515]/10 via-transparent to-[#6B21A8]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <WhyChooseUsSection />

        <ProcessSection />

        <PackagesSection />

        <TestimonialsSection />

        <BlogSection />

        <BookNowSection />

        <ContactSection />
      </main>

      <FooterSection />

      <LoginModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          if (window.location.hash === "#login") {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        }}
      />

      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
        <a
          href={site.phoneHref}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ff8a00] text-white shadow-[0_0_28px_rgba(255,138,0,0.45)] transition hover:scale-105"
          aria-label={`Call ${site.companyName}`}
        >
          <PhoneCall className="h-5 w-5" />
        </a>
        <a
          href={site.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#111] text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition hover:scale-105"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#111] text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition hover:scale-105"
          aria-label="Back to top"
        >
          <MoveRight className="h-5 w-5 -rotate-90" />
        </button>
      </div>

      <AnimatePresence>
        {selectedImage ? (
          <motion.button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[90] grid place-items-center bg-black/88 p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="relative w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/10"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-6 text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-primary">
                  {selectedImage.category}
                </p>
                <h3 className="mt-2 font-heading text-3xl font-semibold text-white">
                  {selectedImage.title}
                </h3>
              </div>
            </motion.div>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
