"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Check, Star } from "lucide-react";
import processBg from "@/src/assets/Portfolio.png";
import { useSite } from "@/src/hooks/useSite";
import { resolveIcon } from "@/src/lib/icons";
import "./process.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ProcessSection() {
  const rootRef = useRef(null);
  const { process } = useSite();
  const steps = process.steps.map((step) => ({
    ...step,
    icon: resolveIcon(step.icon),
  }));
  const particles = process.particles;

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.fromTo(
        "[data-process-head]",
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
        "[data-process-card]",
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 65%", once: true },
        },
      );

      gsap.fromTo(
        "[data-process-cta]",
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 48%", once: true },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      id="process"
      ref={rootRef}
      className="relative isolate overflow-x-clip px-5 py-24 md:px-8 md:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={processBg}
          alt=""
          fill
          priority={false}
          placeholder="blur"
          className="object-cover object-[60%_center] scale-[1.03]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,5,5,0.86) 0%, rgba(5,5,5,0.52) 36%, rgba(5,5,5,0.28) 62%, rgba(5,5,5,0.55) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/94 via-[#050505]/35 to-[#050505]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(107,33,168,0.28),transparent_42%),radial-gradient(circle_at_20%_60%,rgba(255,138,0,0.16),transparent_40%)]" />
        <div className="process-noise absolute inset-0" />
        {particles.map((p) => (
          <span
            key={`${p.left}-${p.bottom}-${p.delay}`}
            className="process-particle"
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
        <div data-process-head className="max-w-3xl">
          <p className="process-label text-[11px] font-medium uppercase tracking-[0.3em]">
            {process.label}
          </p>
          <h2 className="mt-4 font-heading text-[2.35rem] font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.2rem]">
            {process.heading}{" "}
            <span className="process-gold-text">{process.headingHighlight}</span>
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 md:text-[15px] md:leading-8">
            {process.description}
          </p>
        </div>

        <div className="relative mt-14 lg:mt-16">
          <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {/* Timeline: line + nodes + vertical guides — aligned to icon row on desktop */}
            <div
              className="process-timeline pointer-events-none absolute inset-x-0 z-[5] hidden lg:block"
              aria-hidden
            >
              <div className="process-line absolute top-1/2 h-px -translate-y-1/2" />

              <div className="grid h-full grid-cols-5 gap-4">
                {steps.map((item, index) => (
                  <div key={`guide-${item.step}`} className="relative flex items-center justify-center">
                    {index > 0 ? (
                      <span className="process-vline absolute inset-y-[-28px] left-0 w-px -translate-x-1/2" />
                    ) : null}
                    {index < steps.length - 1 ? (
                      <span className="process-node absolute right-0 top-1/2 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fdb515]" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.step}
                  data-process-card
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="process-glass process-card group relative overflow-hidden rounded-[24px]"
                >
                  <div className="relative h-[132px] overflow-hidden sm:h-[140px]">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-transparent" />
                    <span className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#fdb515]/45 bg-black/55 text-[11px] font-semibold text-[#fdb515] backdrop-blur-md">
                      {item.step}
                    </span>
                  </div>

                  <div className="relative z-10 px-4 pb-4 pt-3 xl:px-5 xl:pb-5">
                    <div className="process-icon-slot flex items-center justify-center">
                      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-[#fdb515]/45 bg-[#050505]/90 text-[#fdb515] shadow-[0_0_18px_rgba(253,181,21,0.22)] backdrop-blur-md">
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </div>
                    </div>
                    <h3 className="mt-3.5 font-heading text-lg font-semibold tracking-wide text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-6 text-white/62">{item.desc}</p>
                    <ul className="mt-4 space-y-2.5">
                      {item.items.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-[12px] text-white/72">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#fdb515]" strokeWidth={2.5} />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div
          data-process-cta
          className="process-cta mt-12 flex flex-col items-start gap-5 rounded-[24px] px-5 py-5 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6 lg:mt-16"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#fdb515]/40 bg-[#ff8a00]/12 text-[#fdb515] shadow-[0_0_20px_rgba(253,181,21,0.25)]">
              <Star className="h-5 w-5 fill-current" strokeWidth={1.5} />
            </div>
            <p className="font-heading text-base font-semibold text-[#fdb515] sm:text-lg">
              {process.cta.badge}
            </p>
          </div>

          <p className="max-w-xl text-sm leading-6 text-white/70 sm:text-center md:text-[15px]">
            {process.cta.text}
          </p>

          <a
            href={process.cta.buttonHref}
            className="process-cta-btn group inline-flex shrink-0 items-center gap-2 rounded-full border border-[#fdb515]/55 bg-black/40 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:border-[#fdb515] hover:bg-[#ff8a00]/12"
          >
            {process.cta.buttonLabel}
            <ArrowUpRight className="h-4 w-4 text-[#fdb515] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
