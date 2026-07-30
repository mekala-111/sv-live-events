"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import whyBg from "@/src/assets/Portfolio.png";
import { useSite } from "@/src/hooks/useSite";
import { resolveIcon } from "@/src/lib/icons";
import "./why-choose-us.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function StatCard({ value, suffix, label, desc, icon: Icon, image, tone, mapDots, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [count, setCount] = useState(0);
  const isPurple = tone === "purple";

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    let start = null;
    const duration = 1300;

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

  return (
    <motion.article
      ref={ref}
      data-why-card
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={`why-glass why-stat-card group relative overflow-hidden rounded-[24px] p-5 md:p-6 ${
        isPurple ? "why-glass-purple" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={image}
          alt=""
          fill
          className="object-cover opacity-[0.28] transition duration-500 group-hover:scale-105 group-hover:opacity-[0.38]"
          sizes="(max-width: 768px) 100vw, 320px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-[#050505]/72 to-[#050505]/35" />
        <div
          className={`absolute inset-0 ${
            isPurple
              ? "bg-[radial-gradient(circle_at_80%_20%,rgba(107,33,168,0.35),transparent_55%)]"
              : "bg-[radial-gradient(circle_at_20%_15%,rgba(253,181,21,0.28),transparent_55%)]"
          }`}
        />
        {mapDots ? <div className="why-map-dots absolute inset-0" /> : null}
      </div>

      <div className="relative z-10">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition duration-300 ${
            isPurple
              ? "border-purple-400/40 bg-purple-500/15 text-purple-300 group-hover:shadow-[0_0_22px_rgba(168,85,247,0.45)]"
              : "border-[#fdb515]/40 bg-[#ff8a00]/12 text-[#fdb515] group-hover:shadow-[0_0_22px_rgba(253,181,21,0.45)]"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>

        <p className="mt-5 font-heading text-[2.35rem] font-bold leading-none tracking-[-0.04em] text-white md:text-[2.6rem]">
          {count}
          <span className={isPurple ? "text-purple-300" : "text-[#fdb515]"}>{suffix}</span>
        </p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
          {label}
        </p>
        <p className="mt-2 max-w-[220px] text-sm leading-6 text-white/62">{desc}</p>
      </div>
    </motion.article>
  );
}

export function WhyChooseUsSection() {
  const rootRef = useRef(null);
  const { whyChoose } = useSite();
  const stats = whyChoose.statistics.map((stat) => ({
    ...stat,
    icon: resolveIcon(stat.icon),
  }));
  const categories = whyChoose.categories.map((cat) => ({
    ...cat,
    icon: resolveIcon(cat.icon),
  }));
  const particles = whyChoose.particles;
  const [activeCategory, setActiveCategory] = useState(
    whyChoose.categories[0]?.label ?? "All Events",
  );

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.fromTo(
        "[data-why-left]",
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
        "[data-why-card]",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 68%", once: true },
        },
      );

      gsap.fromTo(
        "[data-why-bar]",
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 55%", once: true },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      id="clients"
      ref={rootRef}
      className="relative isolate overflow-x-clip px-5 py-24 md:px-8 md:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={whyBg}
          alt=""
          fill
          priority={false}
          placeholder="blur"
          className="object-cover object-[62%_center] scale-[1.03]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,5,5,0.88) 0%, rgba(5,5,5,0.55) 32%, rgba(5,5,5,0.18) 58%, rgba(5,5,5,0.45) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/92 via-transparent to-[#050505]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(107,33,168,0.32),transparent_42%),radial-gradient(circle_at_18%_55%,rgba(255,138,0,0.18),transparent_40%),radial-gradient(circle_at_88%_70%,rgba(37,99,235,0.12),transparent_35%)]" />
        <div className="why-flare" />
        <div className="why-noise absolute inset-0" />
        {particles.map((p) => (
          <span
            key={`${p.left}-${p.bottom}-${p.delay}`}
            className="why-particle"
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
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <div data-why-left className="relative z-20 lg:col-span-5 lg:pt-4">
            <div className="mb-4 flex items-center gap-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#fdb515]">
                {whyChoose.label}
              </p>
              <span className="h-px w-14 bg-gradient-to-r from-[#fdb515]/80 to-transparent" />
            </div>

            <h2 className="font-heading text-[2.4rem] font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
              {whyChoose.heading}
              <br />
              {whyChoose.headingLine2}{" "}
              <span className="why-gold-text">{whyChoose.headingHighlight}</span>
            </h2>

            <div className="mt-5 h-px w-24 bg-gradient-to-r from-[#ff8a00] via-[#fdb515] to-transparent" />

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/78 md:text-[15px] md:leading-8">
              {whyChoose.description}
            </p>
          </div>

          <div className="relative z-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {stats.map((stat, index) => (
              <StatCard key={stat.label} {...stat} delay={0.08 * index} />
            ))}
          </div>
        </div>

        <div data-why-bar className="why-cat-bar mt-14 overflow-x-auto rounded-[999px] p-2.5 sm:mt-16 lg:mt-20">
          <div className="flex min-w-max items-center justify-between gap-2 px-1 md:min-w-0 md:flex-wrap md:justify-center lg:flex-nowrap lg:justify-between">
            {categories.map(({ label, icon: Icon }) => {
              const active = activeCategory === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveCategory(label)}
                  aria-pressed={active}
                  className={`why-cat-btn inline-flex items-center gap-2 rounded-full border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] sm:px-5 ${
                    active
                      ? "why-cat-active border-[#fdb515]/65"
                      : "border-white/12 bg-black/25 text-white/75"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
