"use client";

import { memo } from "react";

function Pagination({ count, active, onSelect }) {
  if (count < 2) return null;
  return (
    <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Testimonial slides">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === active}
          aria-label={`Go to testimonial ${index + 1}`}
          onClick={() => onSelect(index)}
          className={`h-2 rounded-full transition ${
            index === active ? "w-10 bg-[#fdb515]" : "w-6 bg-white/18 hover:bg-white/30"
          }`}
        />
      ))}
    </div>
  );
}

export default memo(Pagination);
