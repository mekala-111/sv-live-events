"use client";

import { FloatingCard } from "./FloatingCard";
import { useSite } from "@/src/hooks/useSite";
import { resolveIcon } from "@/src/lib/icons";

export function HeroVisual() {
  const { hero } = useSite();
  const cardData = hero.floatingCards.map((item) => ({
    ...item,
    icon: resolveIcon(item.icon),
  }));

  return (
    <div className="hero-visual-wrap relative z-10 flex w-full justify-end self-start lg:pt-2">
      {/* Desktop / tablet landscape: single clean vertical rail */}
      <div className="hidden w-full max-w-[210px] flex-col gap-3 lg:flex xl:max-w-[230px]">
        {cardData.map((item, index) => (
          <FloatingCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            subtitle={item.subtitle}
            delay={0.35 + index * 0.08}
            className="w-full"
          />
        ))}
      </div>

      {/* Mobile: even 2-column grid, equal row heights */}
      <div className="grid w-full grid-cols-2 gap-3 lg:hidden">
        {cardData.map((item, index) => (
          <FloatingCard
            key={`m-${item.title}`}
            icon={item.icon}
            title={item.title}
            subtitle={item.subtitle}
            delay={0.2 + index * 0.05}
            className="h-full w-full min-w-0"
          />
        ))}
      </div>
    </div>
  );
}
