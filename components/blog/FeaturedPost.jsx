"use client";

import { memo } from "react";
import Image from "next/image";
import ReadMoreButton from "./ReadMoreButton";

/** Featured hero post — rendered only when section.showFeatured is true */
function FeaturedPost({ post, config = {} }) {
  if (!post) return null;

  const image = post.image ?? post.featuredImage ?? post.thumbnail;
  const category = post.tag ?? post.category;
  const date = post.date ?? post.publishDate;
  const href = post.href ?? post.buttonLink ?? "#blog";

  return (
    <article
      data-blog-card
      className="blog-glass mt-12 overflow-hidden rounded-[24px] xl:mt-14"
    >
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-[220px] md:min-h-[280px]">
          {image ? (
            <Image
              src={image}
              alt={post.title ?? ""}
              fill
              loading="lazy"
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : null}
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8">
          {config.showCategory && category ? (
            <span className="inline-flex w-fit rounded-full border border-[#fdb515]/35 bg-[#ff8a00]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fdb515]">
              {category}
            </span>
          ) : null}
          {config.showDate && date ? (
            <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-white/45">
              {date}
              {config.showReadingTime && post.readingTime
                ? ` · ${post.readingTime}`
                : ""}
            </p>
          ) : null}
          <h3 className="mt-3 font-heading text-2xl font-semibold text-white">
            {post.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/65">{post.excerpt}</p>
          <div className="mt-5">
            <ReadMoreButton
              href={href}
              label={post.buttonText ?? "Read Article"}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(FeaturedPost);
