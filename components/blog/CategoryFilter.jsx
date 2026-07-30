"use client";

import { memo } from "react";

function CategoryFilter({ categories = [], active = "All", onChange }) {
  if (!categories.length) return null;

  return (
    <div
      className="mt-8 flex flex-wrap gap-2"
      role="tablist"
      aria-label="Blog categories"
    >
      {categories.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(cat)}
            className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
              isActive
                ? "border-[#fdb515]/60 bg-[#ff8a00]/15 text-[#fdb515]"
                : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

export default memo(CategoryFilter);
