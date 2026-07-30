"use client";

import { memo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Navigation from "./Navigation";
import Pagination from "./Pagination";

function TestimonialsCarousel({ items, config, carousel }) {
  const activeItem = items[carousel.active];

  return (
    <div className="relative lg:col-span-6">
      <div
        className="testimonials-visual relative h-[220px] overflow-hidden rounded-[24px] sm:h-[260px] lg:h-[280px] touch-pan-y select-none"
        {...carousel.handlers}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem?.id ?? carousel.active}
            initial={{ opacity: 0.4, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0"
          >
            <Image
              src={activeItem?.image ?? activeItem?.photo ?? "/assets/hero-1.png"}
              alt={activeItem?.name ?? "Client"}
              fill
              loading="lazy"
              className="pointer-events-none object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,138,0,0.18),transparent_50%)]" />

        {config.showNavigation !== false ? (
          <Navigation
            onPrev={carousel.goPrev}
            onNext={carousel.goNext}
            playing={carousel.playing}
            onTogglePlay={carousel.togglePlay}
            showAutoPlayToggle={config.showAutoPlayToggle !== false}
          />
        ) : null}
      </div>

      {config.showPagination !== false ? (
        <Pagination
          count={items.length}
          active={carousel.active}
          onSelect={carousel.goTo}
        />
      ) : null}
    </div>
  );
}

export default memo(TestimonialsCarousel);
