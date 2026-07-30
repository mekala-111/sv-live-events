"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import portfolioBg from "@/src/assets/Portfolio.png";
import { useBlog } from "@/src/hooks/useBlog";
import BlogHeader from "./BlogHeader";
import FeaturedPost from "./FeaturedPost";
import CategoryFilter from "./CategoryFilter";
import BlogGrid from "./BlogGrid";
import Pagination from "./Pagination";
import BlogCTA from "./BlogCTA";
import "./blog.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Resolve section.backgroundImage without redesigning the cinematic BG */
const BACKGROUND_MAP = {
  portfolio: portfolioBg,
};

function resolveBackground(keyOrPath) {
  if (!keyOrPath) return portfolioBg;
  if (BACKGROUND_MAP[keyOrPath]) return BACKGROUND_MAP[keyOrPath];
  return keyOrPath;
}

export function Blog() {
  const rootRef = useRef(null);
  const {
    blog,
    section,
    posts,
    pagedPosts,
    featuredPost,
    categories,
    category,
    setCategory,
    page,
    setPage,
    totalPages,
  } = useBlog();

  const displayPosts = section.showPagination ? pagedPosts : posts;
  const particles = section.particles ?? [];
  const bgSrc = resolveBackground(
    blog.backgroundImage ?? section.backgroundImage,
  );
  const bgIsStatic = typeof bgSrc === "object";

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.fromTo(
        "[data-blog-head]",
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 72%", once: true },
        },
      );

      gsap.fromTo(
        "[data-blog-card]",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 64%", once: true },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <section
      id="blog"
      ref={rootRef}
      className="relative isolate overflow-x-clip px-5 py-24 md:px-8 md:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={bgSrc}
          alt=""
          fill
          priority={false}
          placeholder={bgIsStatic ? "blur" : "empty"}
          className="object-cover object-[60%_center] scale-[1.03]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.55) 40%, rgba(5,5,5,0.3) 68%, rgba(5,5,5,0.58) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-[#050505]/35 to-[#050505]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(107,33,168,0.26),transparent_42%),radial-gradient(circle_at_18%_55%,rgba(255,138,0,0.14),transparent_40%)]" />
        <div className="blog-noise absolute inset-0" />
        {particles.map((p) => (
          <span
            key={`${p.left}-${p.bottom}-${p.delay}`}
            className="blog-particle"
            style={{
              left: p.left,
              bottom: p.bottom,
              background: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px]">
        <BlogHeader
          label={blog.label ?? section.title}
          heading={blog.heading ?? section.subtitle}
          highlight={blog.headingHighlight ?? section.highlight}
          description={blog.description ?? section.description}
        />

        {section.showCategoryFilter ? (
          <CategoryFilter
            categories={categories}
            active={category}
            onChange={(next) => {
              setCategory(next);
              setPage(1);
            }}
          />
        ) : null}

        {section.showFeatured ? (
          <FeaturedPost post={featuredPost} config={section} />
        ) : null}

        <BlogGrid posts={displayPosts} config={section} />

        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          show={section.showPagination}
        />

        <BlogCTA cta={blog.cta} />
      </div>
    </section>
  );
}

export default Blog;
