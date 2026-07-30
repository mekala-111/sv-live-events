"use client";

import { memo } from "react";

function BlogHeader({ label, heading, highlight, description }) {
  return (
    <div data-blog-head className="max-w-3xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#fdb515]">
        {label}
      </p>
      <h2 className="mt-4 font-heading text-[2.35rem] font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.2rem]">
        {heading} <span className="blog-gold-text">{highlight}</span>
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 md:text-[15px] md:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default memo(BlogHeader);
