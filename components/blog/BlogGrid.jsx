"use client";

import { memo } from "react";
import BlogCard from "./BlogCard";

function BlogGrid({ posts = [], config = {} }) {
  const cols = config.cardsPerRow ?? 3;
  const colClass =
    cols === 2
      ? "md:grid-cols-2"
      : cols === 4
        ? "md:grid-cols-2 xl:grid-cols-4"
        : "md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={`mt-12 grid gap-5 xl:mt-14 ${colClass}`}>
      {posts.map((post, index) => (
        <BlogCard
          key={post.id ?? post.slug ?? post.title}
          post={post}
          index={index}
          config={config}
        />
      ))}
    </div>
  );
}

export default memo(BlogGrid);
