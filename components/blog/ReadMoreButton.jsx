"use client";

import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import { resolveHref } from "@/src/lib/resolveHref";

function ReadMoreButton({ href = "#blog", label = "Read Article", className = "" }) {
  return (
    <a
      href={resolveHref(href)}
      className={`inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-[#fdb515] ${className}`}
    >
      {label}
      <ArrowUpRight className="h-4 w-4 text-[#fdb515]" />
    </a>
  );
}

export default memo(ReadMoreButton);
