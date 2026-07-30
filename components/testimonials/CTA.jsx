"use client";

import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import { resolveIcon } from "@/src/lib/icons";
import { resolveHref } from "@/src/lib/resolveHref";

function CTA({ cta }) {
  if (!cta) return null;
  const Icon = resolveIcon(cta.icon, resolveIcon("Shield"));

  return (
    <div
      data-testimonials-card
      className="testimonials-cta mt-10 flex flex-col gap-5 rounded-[24px] px-5 py-5 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6"
      style={cta.background ? { background: cta.background } : undefined}
    >
      <div className="flex items-start gap-3.5 sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#fdb515]/40 bg-[#ff8a00]/12 text-[#fdb515] shadow-[0_0_20px_rgba(253,181,21,0.25)]">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="max-w-2xl">
          <p className="font-heading text-base font-semibold text-white sm:text-lg">
            {cta.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-white/62">
            {cta.description ?? cta.text}
          </p>
        </div>
      </div>

      <a
        href={resolveHref(cta.buttonLink ?? cta.buttonHref)}
        className="testimonials-cta-btn group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[#fdb515]/55 bg-black/40 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:border-[#fdb515] hover:bg-[#ff8a00]/12 sm:self-center"
      >
        {cta.buttonText ?? cta.buttonLabel}
        <ArrowUpRight className="h-4 w-4 text-[#fdb515] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}

export default memo(CTA);
