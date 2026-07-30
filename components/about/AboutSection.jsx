"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import aboutBg from "@/src/assets/aboutus.png";
import { useSite } from "@/src/hooks/useSite";
import { resolveIcon } from "@/src/lib/icons";
import "./about.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function AboutCounter({ value, suffix, label, icon: Icon, tone, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    let start = null;
    const duration = 1200;

    const tick = (time) => {
      if (start === null) start = time;
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.floor(eased * value));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    const timeout = window.setTimeout(() => {
      frame = window.requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
    };
  }, [inView, value, delay]);

  const isPurple = tone === "purple";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, delay }}
      className="flex min-w-0 flex-1 items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-4"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
          isPurple
            ? "border-purple-400/40 bg-purple-500/15 text-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.25)]"
            : "border-[#fdb515]/40 bg-[#ff8a00]/12 text-[#fdb515] shadow-[0_0_18px_rgba(253,181,21,0.25)]"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="font-heading text-2xl font-bold leading-none text-white md:text-[1.85rem]">
          {count}
          <span className={isPurple ? "text-purple-300" : "text-[#fdb515]"}>{suffix}</span>
        </p>
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-white/55">{label}</p>
      </div>
    </motion.div>
  );
}

export function AboutSection() {
  const rootRef = useRef(null);
  const { about } = useSite();
  const featureCards = about.featureCards.map((card) => ({
    ...card,
    icon: resolveIcon(card.icon),
  }));
  const highlights = about.highlights.map((item) => ({
    ...item,
    icon: resolveIcon(item.icon),
  }));
  const particles = about.particles;

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.fromTo(
        "[data-about-left]",
        { autoAlpha: 0, x: -36 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 72%", once: true },
        },
      );

      gsap.fromTo(
        "[data-about-card]",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 68%", once: true },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      id="about"
      ref={rootRef}
      className="relative isolate overflow-x-clip px-5 py-24 md:px-8 md:py-28 lg:py-32"
    >
      {/* Full-bleed aboutus.png — must stay z-0 (not negative) so it isn't hidden by page bg */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={aboutBg}
          alt="SV Live Events production background"
          fill
          priority
          placeholder="blur"
          className="object-cover object-[60%_center]"
          sizes="100vw"
        />
        {/* Soft left wash for copy — keep the cinematic scene visible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,5,5,0.78) 0%, rgba(5,5,5,0.42) 34%, rgba(5,5,5,0.12) 58%, rgba(5,5,5,0.35) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-[#050505]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_48%,rgba(255,138,0,0.12),transparent_42%)]" />
        <div className="about-noise absolute inset-0" />
        {particles.map((p) => (
          <span
            key={`${p.left}-${p.bottom}-${p.delay}`}
            className="about-particle"
            style={{
              left: p.left,
              bottom: p.bottom,
              background: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px]">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          {/* LEFT — copy */}
          <div data-about-left className="relative z-20 lg:col-span-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#fdb515]">
              {about.label}
            </p>

            <h2 className="mt-5 font-heading text-[2.4rem] font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.25rem] xl:text-[3.6rem]">
              {about.heading}{" "}
              <span className="about-gold-text">{about.headingHighlight}</span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/78 md:text-[15px] md:leading-8">
              {about.description}
            </p>

            <a
              href={about.cta.href}
              className="about-outline-btn group mt-8 inline-flex items-center gap-2.5 rounded-full border border-[#fdb515]/55 bg-black/40 px-7 py-3.5 text-sm font-semibold tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:border-[#fdb515] hover:bg-[#ff8a00]/12"
            >
              {about.cta.label}
              <ArrowRight className="h-4 w-4 text-[#fdb515] transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          {/* RIGHT — clean 2×3 glass grid */}
          <div className="relative z-20 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:col-span-7">
            {featureCards.map((card) => {
              const Icon = card.icon;
              const isPurple = card.tone === "purple";
              return (
                <motion.article
                  key={card.title}
                  data-about-card
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className={`about-glass group rounded-[20px] p-5 ${
                    isPurple ? "about-glass-purple" : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition duration-300 ${
                      isPurple
                        ? "border-purple-400/40 bg-purple-500/15 text-purple-300 group-hover:shadow-[0_0_22px_rgba(168,85,247,0.4)]"
                        : "border-[#fdb515]/40 bg-[#ff8a00]/12 text-[#fdb515] group-hover:shadow-[0_0_22px_rgba(253,181,21,0.4)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 font-heading text-[15px] font-semibold tracking-wide text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{card.blurb}</p>
                </motion.article>
              );
            })}
          </div>
        </div>

        {/* BOTTOM STATS */}
        <div className="about-glass about-stats-bar mt-14 divide-y divide-white/10 rounded-[24px] sm:mt-16 sm:flex sm:divide-x sm:divide-y-0 lg:mt-20">
          {highlights.map((item, index) => (
            <AboutCounter key={item.label} {...item} delay={0.08 * index} />
          ))}
        </div>
      </div>
    </section>
  );
}
