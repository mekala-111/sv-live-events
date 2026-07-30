"use client";

import { memo } from "react";

function Pagination({ page = 1, totalPages = 1, onChange, show = false }) {
  if (!show || totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange?.(page - 1)}
        className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 disabled:opacity-40"
        aria-label="Previous page"
      >
        Prev
      </button>
      <span className="px-3 text-xs uppercase tracking-[0.2em] text-white/50">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange?.(page + 1)}
        className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 disabled:opacity-40"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}

export default memo(Pagination);
