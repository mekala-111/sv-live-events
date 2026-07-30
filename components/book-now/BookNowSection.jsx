"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone } from "lucide-react";
import portfolioBg from "@/src/assets/Portfolio.png";
import { useSite } from "@/src/hooks/useSite";
import "./book-now.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const particles = [
  { left: "14%", bottom: "24%", delay: "0s", duration: "8s", color: "#fdb515" },
  { left: "32%", bottom: "40%", delay: "1.2s", duration: "9s", color: "#ff8a00" },
  { left: "58%", bottom: "30%", delay: "2s", duration: "7.5s", color: "#c084fc" },
  { left: "74%", bottom: "48%", delay: "0.6s", duration: "10s", color: "#fdb515" },
  { left: "88%", bottom: "34%", delay: "1.7s", duration: "8.5s", color: "#60a5fa" },
];

function WhatsAppIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function BookNowSection() {
  const rootRef = useRef(null);
  const { contact, site } = useSite();
  const book = contact.bookNow ?? {};

  const callHref = book.callHref ?? site.phoneHref;
  const whatsappHref = book.whatsappHref ?? site.whatsappHref;
  const callLabel = book.callLabel ?? `Call ${site.phone}`;
  const whatsappLabel = book.whatsappLabel ?? "WhatsApp Booking";

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.fromTo(
        "[data-book-card]",
        { autoAlpha: 0, y: 36, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 72%", once: true },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      id="book-now"
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
          className="object-cover object-[55%_center] scale-[1.04]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.35) 42%, rgba(5,5,5,0.22) 70%, rgba(5,5,5,0.45) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/25 to-[#050505]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(107,33,168,0.22),transparent_42%),radial-gradient(circle_at_20%_60%,rgba(255,138,0,0.12),transparent_40%)]" />
        <div className="book-noise absolute inset-0" />
        {particles.map((p) => (
          <span
            key={`${p.left}-${p.bottom}-${p.delay}`}
            className="book-particle"
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
        <div
          data-book-card
          className="book-card relative min-h-[320px] overflow-hidden rounded-[40px] sm:min-h-[360px] sm:rounded-[48px] lg:min-h-[400px]"
        >
          {/* Card scene — cameraman on the right */}
          <div className="absolute inset-0">
            <Image
              src={portfolioBg}
              alt=""
              fill
              priority={false}
              placeholder="blur"
              className="object-cover object-[78%_42%] scale-[1.08]"
              sizes="(max-width: 1440px) 100vw, 1440px"
            />
          </div>

          {/* Orange → gold wash fading into photo */}
          <div className="book-card-wash absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />

          {/* Content */}
          <div className="relative z-10 flex h-full min-h-[inherit] max-w-[640px] flex-col justify-center px-7 py-10 sm:px-10 sm:py-12 md:px-14 md:py-14 lg:max-w-[58%]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-black/55">
              {book.label ?? "BOOK NOW"}
            </p>
            <h2 className="mt-4 font-heading text-[1.85rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#1a1a1a] sm:text-4xl md:text-[2.75rem] lg:text-[3.1rem]">
              {book.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-black/65 sm:text-[15px] sm:leading-8">
              {book.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
              <a
                href={callHref}
                className="book-btn-call inline-flex items-center justify-center gap-2.5 rounded-full bg-[#0a0a0a] px-6 py-3.5 text-sm font-semibold text-white transition duration-300 sm:px-7"
              >
                <Phone className="h-4 w-4" strokeWidth={2.25} />
                {callLabel}
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="book-btn-wa inline-flex items-center justify-center gap-2.5 rounded-full border border-black/10 px-6 py-3.5 text-sm font-semibold text-[#1a1a1a] transition duration-300 sm:px-7"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#128C7E]" />
                {whatsappLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BookNowSection;
