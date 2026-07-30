"use client";

import { memo } from "react";
import { Star } from "lucide-react";

function RatingStars({ rating = 5, max = 5, className = "flex gap-0.5 text-[#fdb515]" }) {
  const value = Math.max(0, Math.min(max, Number(rating) || 0));
  return (
    <div className={className} aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          className={`h-3.5 w-3.5 ${index < value ? "fill-current" : "fill-transparent opacity-35"}`}
        />
      ))}
    </div>
  );
}

export default memo(RatingStars);
