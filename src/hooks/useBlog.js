"use client";

import { useMemo, useState } from "react";
import { useSite } from "@/src/hooks/useSite";
import { filterBlogPosts } from "@/src/data/blogPosts";

/**
 * Single hook for blog data.
 * Today: SiteContext / local files.
 * Later: replace body with fetch('/api/blog') — UI components stay unchanged.
 */
export function useBlog(options = {}) {
  const { blog } = useSite();
  const section = blog.section ?? {};
  const [category, setCategory] = useState(options.category ?? "All");
  const [query, setQuery] = useState(options.query ?? "");
  const [sortBy, setSortBy] = useState(options.sortBy ?? "date");
  const [page, setPage] = useState(1);

  const allPosts = blog.posts ?? [];

  const posts = useMemo(
    () =>
      filterBlogPosts(allPosts, {
        category,
        query,
        sortBy,
        tag: options.tag,
        author: options.author,
      }),
    [allPosts, category, query, sortBy, options.tag, options.author],
  );

  const featuredPost = useMemo(
    () => posts.find((p) => p.featured) ?? posts[0] ?? null,
    [posts],
  );

  const perPage = options.perPage ?? 9;
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const pagedPosts = useMemo(() => {
    const start = (page - 1) * perPage;
    return posts.slice(start, start + perPage);
  }, [posts, page, perPage]);

  return {
    section,
    blog,
    posts,
    pagedPosts,
    featuredPost,
    categories: section.categories ?? ["All"],
    category,
    setCategory,
    query,
    setQuery,
    sortBy,
    setSortBy,
    page,
    setPage,
    totalPages,
  };
}

export default useBlog;
