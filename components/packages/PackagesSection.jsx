"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Check, Star } from "lucide-react";
import packagesBg from "@/src/assets/Portfolio.png";
import { useSite } from "@/src/hooks/useSite";
import { resolveIcon } from "@/src/lib/icons";
import { resolveHref } from "@/src/lib/resolveHref";
import "./packages.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const particles = [
  { left: "12%", bottom: "28%", delay: "0s", duration: "8s", color: "#fdb515" },
  { left: "28%", bottom: "42%", delay: "1.1s", duration: "9s", color: "#ff8a00" },
  { left: "48%", bottom: "34%", delay: "2s", duration: "7.5s", color: "#fdb515" },
  { left: "66%", bottom: "50%", delay: "0.7s", duration: "10s", color: "#c084fc" },
  { left: "80%", bottom: "38%", delay: "1.6s", duration: "8.5s", color: "#ff8a00" },
  { left: "38%", bottom: "56%", delay: "2.4s", duration: "9.5s", color: "#60a5fa" },
];

export function PackagesSection() {
  const rootRef = useRef(null);
  const { packages: packagesSection, clients } = useSite();
  const highlights = (packagesSection.highlights ?? []).map((item) => ({
    ...item,
    icon: resolveIcon(item.icon),
  }));
  const packages = packagesSection.packages.map((item) => ({
    ...item,
    icon: resolveIcon(item.icon),
  }));
  const CtaIcon = resolveIcon(packagesSection.cta?.icon, resolveIcon("Headphones"));

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.fromTo(
        "[data-packages-head]",
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
        "[data-packages-card]",
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 64%", once: true },
        },
      );

      gsap.fromTo(
        "[data-packages-cta]",
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
      id="packages"
      ref={rootRef}
      className="relative isolate overflow-x-clip px-5 py-24 md:px-8 md:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={packagesBg}
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
              "linear-gradient(90deg, rgba(5,5,5,0.88) 0%, rgba(5,5,5,0.55) 36%, rgba(5,5,5,0.28) 62%, rgba(5,5,5,0.6) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/94 via-[#050505]/35 to-[#050505]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(107,33,168,0.28),transparent_42%),radial-gradient(circle_at_20%_60%,rgba(255,138,0,0.16),transparent_40%)]" />
        <div className="packages-noise absolute inset-0" />
        {particles.map((p) => (
          <span
            key={`${p.left}-${p.bottom}-${p.delay}`}
            className="packages-particle"
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
        <div data-packages-head className="max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#fdb515]">
            {packagesSection.label}
          </p>
          <h2 className="mt-4 font-heading text-[2.35rem] font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.2rem]">
            {packagesSection.heading}{" "}
            <span className="packages-gold-text">{packagesSection.headingHighlight}</span>{" "}
            {packagesSection.headingSuffix}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 md:text-[15px] md:leading-8">
            {packagesSection.description}
          </p>
        </div>

        <div
          data-packages-head
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4"
        >
          {highlights.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#fdb515]/40 bg-[#ff8a00]/12 text-[#fdb515] shadow-[0_0_18px_rgba(253,181,21,0.2)]">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-[12px] leading-5 text-white/55">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:mt-14 xl:grid-cols-4 xl:gap-5">
          {packages.map((item) => {
            const Icon = item.icon;
            const features = item.features ?? item.items ?? [];
            return (
              <motion.article
                key={item.id ?? item.title}
                data-packages-card
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className={`packages-glass packages-card group relative flex flex-col overflow-hidden rounded-[24px] ${
                  item.recommended || item.popular ? "packages-card-featured" : ""
                }`}
              >
                <div className="relative h-[148px] overflow-hidden sm:h-[160px]">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 1280px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/45 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,138,0,0.2),transparent_50%)]" />

                  <span className="absolute left-4 top-4 z-10 inline-flex rounded-full border border-[#fdb515]/40 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fdb515] backdrop-blur-md">
                    {item.badge}
                  </span>

                  {item.ribbon || item.popular ? (
                    <span className="packages-ribbon" aria-hidden>
                      <Star className="h-4 w-4 fill-current" strokeWidth={1.5} />
                    </span>
                  ) : null}
                </div>

                <div className="relative z-10 flex flex-1 flex-col p-5 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#fdb515]/35 bg-[#ff8a00]/10 text-[#fdb515] shadow-[0_0_18px_rgba(253,181,21,0.18)]">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </div>

                  <h3 className="mt-4 font-heading text-xl font-semibold tracking-wide text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-heading text-2xl font-bold text-[#fdb515]">{item.price}</p>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-[13px] text-white/72">
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#fdb515]"
                          strokeWidth={2.5}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={resolveHref(item.button?.href)}
                    className="packages-enquire mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-[#fdb515]/45 bg-black/40 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:border-[#fdb515] hover:bg-[#ff8a00]/12"
                  >
                    {item.button?.label ?? "Enquire Package"}
                    <ArrowUpRight className="h-4 w-4 text-[#fdb515]" />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div
          data-packages-cta
          className="packages-cta mt-12 flex flex-col gap-6 rounded-[24px] px-5 py-5 sm:mt-14 sm:px-7 sm:py-6 lg:mt-16 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex max-w-md items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#fdb515]/40 bg-[#ff8a00]/12 text-[#fdb515] shadow-[0_0_20px_rgba(253,181,21,0.25)]">
              <CtaIcon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-heading text-base font-semibold text-white sm:text-lg">
                {packagesSection.cta?.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-white/62">{packagesSection.cta?.text}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45 lg:flex-1">
            {(clients?.clients ?? []).map((client) => (
              <span key={client.id} className="transition hover:text-white/70">
                {client.name}
              </span>
            ))}
          </div>

          <a
            href={resolveHref(packagesSection.cta?.buttonHref)}
            className="packages-cta-btn group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[#fdb515]/55 bg-black/40 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:border-[#fdb515] hover:bg-[#ff8a00]/12 lg:self-center"
          >
            {packagesSection.cta?.buttonLabel}
            <ArrowUpRight className="h-4 w-4 text-[#fdb515] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
