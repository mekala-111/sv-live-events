"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import servicesBg from "@/src/assets/bg.png";
import { useSite } from "@/src/hooks/useSite";
import { resolveIcon } from "@/src/lib/icons";
import "./services.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function ServicesCounter({ value, suffix, label, icon: Icon, tone, delay = 0 }) {
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
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay }}
      className="flex min-w-0 flex-1 items-center gap-3.5 px-4 py-3.5 sm:px-5 sm:py-4"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
          isPurple
            ? "border-purple-400/40 bg-purple-500/15 text-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.28)]"
            : "border-[#fdb515]/40 bg-[#ff8a00]/12 text-[#fdb515] shadow-[0_0_18px_rgba(253,181,21,0.28)]"
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

export function ServicesSection() {
  const rootRef = useRef(null);
  const { services } = useSite();
  const serviceCards = services.services.map((service) => ({
    title: service.title,
    blurb: service.shortDescription,
    items: service.features,
    image: service.image,
    tone: service.tone,
  }));
  const highlights = services.highlights.map((item) => ({
    ...item,
    icon: resolveIcon(item.icon),
  }));
  const particles = services.particles;

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.fromTo(
        "[data-services-header]",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 72%", once: true },
        },
      );

      gsap.fromTo(
        "[data-services-card]",
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 64%", once: true },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      id="services"
      ref={rootRef}
      className="relative isolate overflow-x-clip px-5 py-24 md:px-8 md:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={servicesBg}
          alt=""
          fill
          className="object-cover object-[70%_center] scale-[1.02]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,5,5,0.88) 0%, rgba(5,5,5,0.62) 38%, rgba(5,5,5,0.4) 62%, rgba(5,5,5,0.72) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/25 to-[#050505]/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(107,33,168,0.28),transparent_34%),radial-gradient(circle_at_82%_30%,rgba(37,99,235,0.16),transparent_30%),radial-gradient(circle_at_70%_70%,rgba(255,138,0,0.14),transparent_32%)]" />
        <div className="services-noise absolute inset-0" />
        <div className="services-ray left-[8%] top-[24%] w-[42%] rotate-[-16deg]" />
        <div
          className="services-ray right-[10%] top-[62%] w-[38%] rotate-[10deg]"
          style={{ animationDelay: "1.3s" }}
        />
        {particles.map((p) => (
          <span
            key={`${p.left}-${p.bottom}`}
            className="services-particle"
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
        {/* Header */}
        <div
          data-services-header
          className="mb-12 grid items-end gap-8 lg:mb-14 lg:grid-cols-12 lg:gap-10"
        >
          <div className="lg:col-span-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="services-label-line" />
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[#fdb515]">
                {services.label}
              </p>
              <span className="services-label-line" />
            </div>

            <h2 className="font-heading text-[2.35rem] font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.35rem] xl:text-[3.7rem]">
              {services.heading}{" "}
              <span className="services-gold-text">{services.headingHighlight}</span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 md:text-[15px] md:leading-8">
              {services.description}
            </p>
          </div>

          <div className="relative hidden h-44 overflow-hidden rounded-[24px] border border-[#fdb515]/25 shadow-[0_24px_60px_rgba(0,0,0,0.45)] lg:col-span-5 lg:block lg:h-52">
            <Image
              src={services.headerImage}
              alt="SV Live Events production crew"
              fill
              className="object-cover object-[70%_center]"
              sizes="420px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,138,0,0.2),transparent_50%)]" />
          </div>
        </div>

        {/* 3×2 service cards */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
          {serviceCards.map((service) => {
            const isPurple = service.tone === "purple";
            return (
              <article
                key={service.title}
                data-services-card
                className={`services-glass services-card group relative flex min-h-[460px] flex-col overflow-hidden rounded-[24px] sm:min-h-[500px] ${
                  isPurple ? "services-glass-purple services-card-purple" : ""
                }`}
              >
                <div className="relative h-[40%] min-h-[180px] shrink-0 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover object-center transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/45 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,138,0,0.18),transparent_45%)]" />
                  <span
                    className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-black/35 backdrop-blur-sm transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      isPurple
                        ? "border-purple-400/40 text-purple-300"
                        : "border-[#fdb515]/40 text-[#fdb515]"
                    }`}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="relative flex flex-1 flex-col p-5 pt-5 sm:p-6">
                  <h3 className="font-heading text-xl font-semibold tracking-wide text-white">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{service.blurb}</p>

                  <ul className="mt-5 space-y-2.5">
                    {service.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-white/78">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            isPurple ? "bg-purple-300" : "bg-[#fdb515]"
                          }`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* Stats bar */}
        <div className="services-glass services-stats-bar mt-12 divide-y divide-white/10 rounded-[24px] sm:mt-14 sm:flex sm:divide-x sm:divide-y-0 lg:mt-16">
          {highlights.map((item, index) => (
            <ServicesCounter key={item.label} {...item} delay={0.08 * index} />
          ))}
        </div>
      </div>
    </section>
  );
}
