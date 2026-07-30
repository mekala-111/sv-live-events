"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import testimonialsBg from "@/src/assets/Portfolio.png";
import { useSite } from "@/src/hooks/useSite";
import { filterTestimonials } from "@/src/data/testimonialsData";
import SectionHeader from "./SectionHeader";
import TestimonialsCarousel from "./TestimonialsCarousel";
import TestimonialCard from "./TestimonialCard";
import CTA from "./CTA";
import { useTestimonialsCarousel } from "./useTestimonialsCarousel";
import "./testimonials.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Main Testimonials section.
 * Data from SiteContext (local files today → GET /api/testimonials later).
 * Optional filters prepared for admin without changing current UI.
 */
export function Testimonials({ filters } = {}) {
  const rootRef = useRef(null);
  const { testimonials: data, clients } = useSite();
  const section = data.section ?? {};
  const brands = clients?.clients ?? [];

  const items = useMemo(() => {
    const source = data.items ?? [];
    return filters ? filterTestimonials(source, filters) : source;
  }, [data.items, filters]);

  const carousel = useTestimonialsCarousel(items, {
    autoplay: section.autoplay ?? data.autoPlay !== false,
    interval: section.interval ?? data.interval ?? 4500,
    pauseOnHover: section.pauseOnHover !== false,
    infinite: section.infinite !== false,
  });

  const config = {
    showRating: section.showRating !== false,
    showCompany: section.showCompany !== false,
    showLocation: section.showLocation !== false,
    showNavigation: section.showNavigation !== false,
    showPagination: section.showPagination === true ? true : false,
    showAutoPlayToggle: section.showAutoPlayToggle !== false,
  };

  // Keep pagination hidden by default to preserve approved UI (dots were not in original layout)
  // User asked for pagination feature — enable via section.showPagination: true

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.fromTo(
        "[data-testimonials-head]",
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 72%", once: true },
        },
      );

      gsap.fromTo(
        "[data-testimonials-card]",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 62%", once: true },
        },
      );
    },
    { scope: rootRef },
  );

  const particles = data.particles ?? section.particles ?? [];

  return (
    <section
      id="testimonials"
      ref={rootRef}
      className="relative isolate overflow-x-clip px-5 py-24 md:px-8 md:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={testimonialsBg}
          alt=""
          fill
          priority={false}
          placeholder="blur"
          className="object-cover object-[65%_center] scale-[1.03]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.58) 40%, rgba(5,5,5,0.3) 68%, rgba(5,5,5,0.55) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-[#050505]/35 to-[#050505]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(107,33,168,0.28),transparent_42%),radial-gradient(circle_at_18%_55%,rgba(255,138,0,0.14),transparent_40%)]" />
        <div className="testimonials-noise absolute inset-0" />
        {particles.map((p) => (
          <span
            key={`${p.left}-${p.bottom}-${p.delay}`}
            className="testimonials-particle"
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
          data-testimonials-head
          className="grid items-end gap-8 lg:grid-cols-12 lg:gap-10"
        >
          <SectionHeader
            label={data.label ?? section.title}
            heading={data.heading ?? section.subtitle}
            highlight={data.headingHighlight ?? section.highlight}
            suffix={data.headingSuffix ?? section.suffix}
            description={data.description ?? section.description}
          />

          <TestimonialsCarousel items={items} config={config} carousel={carousel} />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:mt-14 xl:grid-cols-4">
          {items.map((item) => (
            <TestimonialCard key={item.id ?? item.name} item={item} config={config} />
          ))}
        </div>

        <div className="mt-12 sm:mt-14">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
            {data.brandsLabel ?? section.brandsLabel}
          </p>
          <div className="testimonials-brands mt-4 overflow-x-auto rounded-[999px] px-4 py-4">
            <div className="flex min-w-max items-center justify-center gap-0 md:min-w-0 md:flex-wrap md:justify-between">
              {brands.map((brand, index) => (
                <div key={brand.id} className="flex items-center">
                  <span className="px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55 sm:px-5">
                    {brand.name}
                  </span>
                  {index < brands.length - 1 ? (
                    <span className="hidden h-4 w-px bg-white/15 sm:block" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <CTA cta={section.cta ?? data.cta} />
      </div>
    </section>
  );
}

export function TestimonialsSection(props) {
  return <Testimonials {...props} />;
}

export default Testimonials;
