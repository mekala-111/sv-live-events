"use client";

import { motion } from "framer-motion";

export function FloatingChip({ label, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="hero-glass flex h-full min-h-[44px] w-full min-w-0 items-center justify-start gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm text-white/90 sm:px-4"
    >
      {Icon ? (
        <Icon className="h-4 w-4 shrink-0 text-[#fdb515]" strokeWidth={1.75} />
      ) : null}
      <span className="truncate font-medium tracking-wide">{label}</span>
    </motion.div>
  );
}
