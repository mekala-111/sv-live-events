"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";
import portfolioBg from "@/src/assets/Portfolio.png";
import { useSite } from "@/src/hooks/useSite";
import { resolveHref } from "@/src/lib/resolveHref";
import "./contact.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const particles = [
  { left: "12%", bottom: "26%", delay: "0s", duration: "8s", color: "#fdb515" },
  { left: "30%", bottom: "42%", delay: "1.1s", duration: "9s", color: "#ff8a00" },
  { left: "55%", bottom: "32%", delay: "2s", duration: "7.5s", color: "#c084fc" },
  { left: "72%", bottom: "50%", delay: "0.7s", duration: "10s", color: "#fdb515" },
  { left: "88%", bottom: "36%", delay: "1.6s", duration: "8.5s", color: "#60a5fa" },
];

function WhatsAppIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.4V9.41c0-2.37 1.41-3.68 3.57-3.68 1.03 0 2.12.18 2.12.18v2.33h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.9h-2.22V22c4.78-.75 8.44-4.91 8.44-9.93z" />
    </svg>
  );
}

const channelIcons = {
  WhatsApp: WhatsAppIcon,
  Instagram,
  Facebook: FacebookIcon,
  Youtube,
};

const itemIcons = {
  Phone,
  Mail,
  MapPin,
};

export function ContactSection() {
  const rootRef = useRef(null);
  const { contact } = useSite();
  const items = contact.items ?? [];
  const channels = contact.channels ?? [];

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.fromTo(
        "[data-contact-card]",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 70%", once: true },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      id="contact"
      ref={rootRef}
      className="relative isolate overflow-x-clip px-5 py-24 md:px-8 md:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={portfolioBg}
          alt=""
          fill
          priority={false}
          placeholder="blur"
          className="object-cover object-[62%_center] scale-[1.04]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,5,5,0.88) 0%, rgba(5,5,5,0.55) 42%, rgba(5,5,5,0.35) 70%, rgba(5,5,5,0.62) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-[#050505]/30 to-[#050505]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(107,33,168,0.22),transparent_42%),radial-gradient(circle_at_18%_55%,rgba(255,138,0,0.14),transparent_40%)]" />
        <div className="contact-noise absolute inset-0" />
        {particles.map((p) => (
          <span
            key={`${p.left}-${p.bottom}-${p.delay}`}
            className="contact-particle"
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
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
          {/* Main contact card */}
          <article
            data-contact-card
            className="contact-glass rounded-[28px] p-7 sm:rounded-[32px] sm:p-8 md:p-10"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#fdb515]">
              {contact.label}
            </p>
            <h2 className="mt-4 font-heading text-[1.85rem] font-bold leading-[1.12] tracking-[-0.035em] text-white sm:text-4xl md:text-[2.6rem]">
              {contact.heading}{" "}
              <span className="contact-gold-text">
                {contact.headingHighlight ?? "together."}
              </span>
            </h2>
            <div className="mt-5 h-[2px] w-14 rounded-full bg-gradient-to-r from-[#ff8a00] to-[#fdb515]" />

            <div className="mt-8 divide-y divide-white/10 sm:mt-10">
              {items.map((item) => {
                const Icon = itemIcons[item.icon] ?? Phone;
                const Wrapper = item.href ? "a" : "div";
                const wrapperProps = item.href
                  ? { href: resolveHref(item.href) }
                  : {};

                return (
                  <Wrapper
                    key={item.id}
                    {...wrapperProps}
                    className="flex items-start gap-4 py-5 first:pt-0 last:pb-0 transition hover:opacity-95"
                  >
                    <div className="contact-icon-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#fdb515]/45 bg-[#ff8a00]/12 text-[#fdb515]">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white sm:text-lg">
                        {item.value}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-white/55">{item.detail}</p>
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </article>

          {/* Social channels grid */}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {channels.map((channel) => {
              const Icon = channelIcons[channel.icon] ?? Instagram;
              const isExternal = String(channel.href ?? "").startsWith("http");

              return (
                <motion.a
                  key={channel.label}
                  data-contact-card
                  href={resolveHref(channel.href)}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="contact-glass group flex min-h-[168px] flex-col justify-between rounded-[24px] p-6 sm:min-h-[190px] sm:rounded-[28px] sm:p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#fdb515]/40 bg-[#ff8a00]/10 text-[#fdb515]">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>

                  <div className="mt-8 flex items-end justify-between gap-3">
                    <div>
                      <p className="font-heading text-xl font-semibold text-white sm:text-2xl">
                        {channel.label}
                      </p>
                      <p className="mt-1.5 text-sm text-white/50">
                        {channel.detail ?? "Open channel"}
                      </p>
                    </div>
                    <span className="contact-arrow flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#fdb515]/45 bg-[#ff8a00]/12 text-[#fdb515] transition duration-300 group-hover:bg-[#ff8a00]/22">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
