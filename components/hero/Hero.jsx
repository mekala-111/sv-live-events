"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { HeroContent } from "./HeroContent";
import { HeroVisual } from "./HeroVisual";
import { AnimatedCounter } from "./AnimatedCounter";
import { BackgroundEffects } from "./BackgroundEffects";
import { useSite } from "@/src/hooks/useSite";
import { resolveIcon } from "@/src/lib/icons";
import "./hero.css";

gsap.registerPlugin(useGSAP);

export function Hero({ backgroundVideoSrc } = {}) {
  const rootRef = useRef(null);
  const { hero } = useSite();
  const counters = hero.counters.map((item) => ({
    ...item,
    icon: resolveIcon(item.icon),
  }));

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-word",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.85 },
      )
        .fromTo(
          ".hero-copy",
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          "-=0.4",
        )
        .fromTo(
          ".hero-actions",
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.45",
        )
        .fromTo(
          ".hero-visual-wrap",
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.85, ease: "power2.out" },
          0.25,
        );
    },
    { scope: rootRef },
  );

  return (
    <section
      id="home"
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col overflow-x-clip"
    >
      <BackgroundEffects
        backgroundVideoSrc={backgroundVideoSrc ?? hero.backgroundVideo}
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1520px] flex-1 flex-col px-5 pb-10 pt-28 md:px-8 md:pt-32 lg:pb-12">
        <div className="grid flex-1 items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(210px,0.38fr)] lg:gap-10 xl:gap-14">
          <HeroContent />
          <HeroVisual />
        </div>

        <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-10 lg:grid-cols-5 lg:gap-4">
          {counters.map((item, index) => (
            <AnimatedCounter key={item.label} {...item} delay={0.08 * index} />
          ))}
        </div>
      </div>
    </section>
  );
}
