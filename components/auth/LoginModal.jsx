"use client";

import { useEffect, useId } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import logo from "@/src/assets/logo-sm.png";
import { loginData } from "@/src/data/loginData";
import { platformUrl } from "@/lib/platform";
import { resolveHref } from "@/src/lib/resolveHref";
import "./login-modal.css";

/** Landing gate only — real auth is a single form on the platform /login page */
export function LoginModal({ open, onClose }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const goLogin = () => {
    window.location.href = platformUrl("/login");
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="login-overlay fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="login-panel relative w-full max-w-[440px] overflow-hidden rounded-[28px] px-6 py-8 sm:max-w-[520px] sm:px-9 sm:py-10 md:max-w-[560px]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sign in"
              className="login-close absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full text-white/80 sm:right-5 sm:top-5"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="login-logo-ring relative h-[72px] w-[72px] overflow-hidden rounded-full bg-black/70 p-1.5 sm:h-20 sm:w-20">
                <Image
                  src={logo}
                  alt="SV Live Events"
                  fill
                  className="object-cover"
                  sizes="80px"
                  priority
                />
              </div>

              <h2
                id={titleId}
                className="mt-5 font-heading text-[1.85rem] font-bold tracking-[-0.03em] text-white sm:text-[2.15rem]"
              >
                {loginData.title}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/55 sm:text-[15px]">
                Continue to the client portal to sign in once — Event Portal, bookings, and live streams.
              </p>
            </div>

            <div className="relative z-10 mt-8 space-y-4">
              <button
                type="button"
                onClick={goLogin}
                className="login-submit group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-[#111]"
              >
                Continue to Sign In
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>

              <div className="login-demo rounded-2xl p-4 text-left sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#fdb515]">
                  {loginData.demoTitle}
                </p>
                <div className="mt-3 space-y-2 text-[13px] leading-5 text-white/60">
                  {loginData.demos.map((demo) => (
                    <p key={demo.id}>
                      <span className="font-semibold text-white/85">{demo.role}:</span>{" "}
                      {demo.email} / {demo.password}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <p className="relative z-10 mt-6 text-center text-sm text-white/50">
              {loginData.createPrompt}{" "}
              <a
                href={resolveHref(loginData.createHref)}
                className="font-semibold text-[#fdb515] transition hover:underline"
              >
                {loginData.createLabel}
              </a>
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default LoginModal;
