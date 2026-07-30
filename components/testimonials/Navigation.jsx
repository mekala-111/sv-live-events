"use client";

import { memo } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

function Navigation({
  onPrev,
  onNext,
  playing,
  onTogglePlay,
  showAutoPlayToggle = true,
}) {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous testimonial"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:border-[#fdb515]/45 hover:text-[#fdb515]"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next testimonial"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:border-[#fdb515]/45 hover:text-[#fdb515]"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
      {showAutoPlayToggle ? (
        <button
          type="button"
          onClick={onTogglePlay}
          aria-pressed={playing}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-black/45 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md transition hover:border-[#fdb515]/45 hover:text-[#fdb515]"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          Auto Play
        </button>
      ) : null}
    </div>
  );
}

export default memo(Navigation);
