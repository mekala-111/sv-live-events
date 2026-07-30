"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Carousel controller — autoplay, infinite loop, keyboard, swipe, drag.
 */
export function useTestimonialsCarousel(items, config = {}) {
  const {
    autoplay = true,
    interval = 4500,
    pauseOnHover = true,
    infinite = true,
  } = config;

  const count = items.length;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [hovering, setHovering] = useState(false);
  const dragRef = useRef({ startX: 0, dragging: false });

  const goTo = useCallback(
    (index) => {
      if (!count) return;
      if (infinite) {
        setActive(((index % count) + count) % count);
      } else {
        setActive(Math.max(0, Math.min(count - 1, index)));
      }
    },
    [count, infinite],
  );

  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);
  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);
  const togglePlay = useCallback(() => setPlaying((v) => !v), []);

  useEffect(() => {
    setPlaying(autoplay);
  }, [autoplay]);

  useEffect(() => {
    if (!playing || (pauseOnHover && hovering) || count < 2) return;
    const id = window.setInterval(goNext, interval);
    return () => window.clearInterval(id);
  }, [playing, pauseOnHover, hovering, count, interval, goNext]);

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      } else if (event.key === " ") {
        event.preventDefault();
        togglePlay();
      }
    },
    [goPrev, goNext, togglePlay],
  );

  const onPointerDown = useCallback((event) => {
    dragRef.current = { startX: event.clientX, dragging: true };
  }, []);

  const onPointerUp = useCallback(
    (event) => {
      if (!dragRef.current.dragging) return;
      const delta = event.clientX - dragRef.current.startX;
      dragRef.current.dragging = false;
      if (Math.abs(delta) < 40) return;
      if (delta > 0) goPrev();
      else goNext();
    },
    [goPrev, goNext],
  );

  const onPointerLeave = useCallback(() => {
    dragRef.current.dragging = false;
    if (pauseOnHover) setHovering(false);
  }, [pauseOnHover]);

  return {
    active,
    playing,
    setPlaying,
    togglePlay,
    goPrev,
    goNext,
    goTo,
    setHovering,
    handlers: {
      onKeyDown,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerEnter: () => pauseOnHover && setHovering(true),
      tabIndex: 0,
      role: "region",
      "aria-roledescription": "carousel",
    },
  };
}
