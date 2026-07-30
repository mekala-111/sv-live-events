"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedCounter({
  value,
  suffix = "",
  label,
  icon: Icon,
  delay = 0,
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start = null;
    const duration = 1100;

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
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="hero-glass flex h-full min-w-0 items-center gap-3 rounded-2xl px-4 py-3.5"
    >
      {Icon ? (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#fdb515]/30 bg-[#ff8a00]/12">
          <Icon className="h-4 w-4 text-[#fdb515]" strokeWidth={1.75} />
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="font-heading text-xl font-bold leading-none text-white md:text-2xl">
          {count}
          <span className="text-[#fdb515]">{suffix}</span>
        </p>
        <p className="mt-1.5 text-[10px] uppercase leading-tight tracking-[0.12em] text-white/60">
          {label}
        </p>
      </div>
    </motion.div>
  );
}
