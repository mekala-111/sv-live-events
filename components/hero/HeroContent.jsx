"use client";

import { ArrowRight, Play, Star } from "lucide-react";
import { FloatingChip } from "./FloatingChip";
import { motion } from "framer-motion";
import { useSite } from "@/src/hooks/useSite";
import { resolveIcon } from "@/src/lib/icons";
import { resolveHref } from "@/src/lib/resolveHref";

function MagneticButton({ href, children, variant = "primary", className = "" }) {
  const base =
    variant === "primary"
      ? "hero-btn-glow group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#ffe08a] via-[#fdb515] to-[#ff8a00] px-7 py-3.5 text-sm font-semibold tracking-wide text-black transition-transform duration-200 hover:scale-[1.02] md:py-4 md:text-base"
      : "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full border border-[#fdb515]/45 bg-white/[0.06] px-7 py-3.5 text-sm font-semibold tracking-wide text-white backdrop-blur-sm transition-all duration-200 hover:border-[#fdb515]/75 hover:bg-white/10 md:py-4 md:text-base";

  return (
    <a href={href} className={`${base} ${className}`}>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {children}
    </a>
  );
}

export function HeroContent() {
  const { hero } = useSite();
  const chips = hero.chips.map((chip) => ({
    ...chip,
    icon: resolveIcon(chip.icon),
  }));
  const [primaryBtn, secondaryBtn] = hero.buttons;

  return (
    <div className="relative z-10 w-full max-w-xl self-start xl:max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-4 inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] uppercase tracking-[0.24em] text-white/90 sm:mb-5"
      >
        <span className="flex items-center gap-0.5 text-[#fdb515]">
          {Array.from({ length: hero.starCount }).map((_, index) => (
            <Star
              key={index}
              className="h-3.5 w-3.5 fill-current drop-shadow-[0_0_8px_rgba(253,181,21,0.7)]"
            />
          ))}
        </span>
        {hero.eyebrow}
      </motion.div>

      <h1 className="font-heading text-[2.55rem] font-bold leading-[0.92] tracking-[-0.045em] text-white sm:text-[3.75rem] lg:text-[4.5rem] xl:text-[5.2rem]">
        {hero.headline.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={`hero-word block${
              hero.goldWordIndexes.includes(index)
                ? ` hero-gold-text${index === hero.goldWordIndexes[0] ? " mt-1.5 sm:mt-2.5" : ""}`
                : ""
            }`}
          >
            {word}
          </span>
        ))}
      </h1>

      <p className="hero-copy mt-4 max-w-[34rem] text-sm leading-7 text-white/78 md:mt-5 md:text-[15px] md:leading-8">
        {hero.description}
      </p>

      <div className="hero-actions mt-6 flex w-full flex-col gap-3 sm:mt-7 sm:flex-row sm:items-stretch">
        <MagneticButton
          href={resolveHref(primaryBtn.href)}
          variant="primary"
          className="w-full sm:min-w-0 sm:flex-1"
        >
          {primaryBtn.label}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </MagneticButton>
        <MagneticButton
          href={resolveHref(secondaryBtn.href)}
          variant="secondary"
          className="w-full sm:min-w-0 sm:flex-1"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#fdb515]/55 bg-[#ff8a00]/15 shadow-[0_0_16px_rgba(253,181,21,0.25)]">
            <Play className="h-3 w-3 fill-current text-[#fdb515]" />
          </span>
          {secondaryBtn.label}
        </MagneticButton>
      </div>

      <div className="mt-5 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 sm:mt-6">
        {chips.map((chip, index) => (
          <FloatingChip
            key={chip.label}
            label={chip.label}
            icon={chip.icon}
            delay={0.45 + index * 0.05}
          />
        ))}
      </div>
    </div>
  );
}
