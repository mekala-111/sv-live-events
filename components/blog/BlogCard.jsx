"use client";

import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import AuthorCard from "./AuthorCard";
import ReadMoreButton from "./ReadMoreButton";

function BlogCard({ post, index = 0, config = {} }) {
  const {
    showDate = true,
    showReadingTime = false,
    showAuthor = true,
    showCategory = true,
  } = config;

  const category = post.tag ?? post.category;
  const date = post.date ?? post.publishDate;
  const image = post.image ?? post.featuredImage ?? post.thumbnail;
  const authorName = post.author?.name ?? post.author;
  const authorRole = post.author?.role ?? post.authorRole;
  const authorAvatar = post.author?.avatar ?? post.authorImage;
  const href = post.href ?? post.buttonLink ?? "#blog";
  const buttonText = post.buttonText ?? "Read Article";

  return (
    <motion.article
      data-blog-card
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="blog-glass blog-card group flex flex-col overflow-hidden rounded-[24px]"
    >
      <div className="relative h-[180px] overflow-hidden sm:h-[200px]">
        {image ? (
          <Image
            src={image}
            alt={post.title ?? ""}
            fill
            loading="lazy"
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 1280px) 50vw, 33vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/35 to-transparent" />
      </div>

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          {showCategory && category ? (
            <span className="inline-flex rounded-full border border-[#fdb515]/35 bg-[#ff8a00]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fdb515]">
              {category}
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/45">
            {showDate && date ? <span>{date}</span> : null}
            {showReadingTime && post.readingTime ? (
              <span>· {post.readingTime}</span>
            ) : null}
          </div>
        </div>

        <h3 className="mt-4 font-heading text-xl font-semibold leading-snug tracking-wide text-white">
          {post.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-7 text-white/65">{post.excerpt}</p>

        <AuthorCard
          name={authorName}
          role={authorRole}
          avatar={authorAvatar}
          show={showAuthor}
        />

        <div className="mt-5 flex items-center justify-between">
          <ReadMoreButton href={href} label={buttonText} />
          <span className="text-xs uppercase tracking-[0.3em] text-white/30">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default memo(BlogCard);
