"use client";

import { motion } from "framer-motion";

export function FloatingCard({
  icon: Icon,
  title,
  subtitle,
  className = "",
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay }}
      className={`hero-glass flex h-full min-w-0 flex-col rounded-2xl px-4 py-3.5 backdrop-blur-md transition-transform duration-200 hover:-translate-y-1 ${className}`}
    >
      {Icon ? (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#fdb515]/35 bg-[#ff8a00]/12 shadow-[0_0_18px_rgba(253,181,21,0.18)]">
          <Icon className="h-4 w-4 text-[#fdb515]" strokeWidth={1.75} />
        </div>
      ) : null}
      <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#fdb515]">
        {title}
      </p>
      <p className="mt-1 text-sm leading-snug text-white/75">{subtitle}</p>
    </motion.div>
  );
}
