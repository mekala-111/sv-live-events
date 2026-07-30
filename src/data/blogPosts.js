/**
 * Blog posts array — CMS/API ready.
 * Swap for GET /api/blog — keep this shape.
 */
export const blogPosts = [
  {
    id: 1,
    slug: "how-premium-event-coverage-builds-brand-memory",
    title: "How Premium Event Coverage Builds Brand Memory",
    subtitle: "Why cinematic coverage outperforms snapshots",
    excerpt:
      "Premium visuals do more than document a moment. They elevate how audiences remember it and how brands extend it online.",
    content:
      "Premium visuals do more than document a moment. They elevate how audiences remember it and how brands extend it online.",
    category: "Strategy",
    author: "Suman Narsing",
    authorRole: "Founder, SV Live Events",
    authorImage: "/assets/blog/authors/suman-narsing.png",
    publishDate: "May 18, 2025",
    readingTime: "5 min",
    featuredImage: "/assets/blog/covers/brand-memory.png",
    thumbnail: "/assets/blog/thumbnails/brand-memory.png",
    gallery: ["/assets/blog/covers/brand-memory.png"],
    video: null,
    tags: ["Strategy", "Branding", "Coverage"],
    featured: true,
    popular: true,
    seoTitle: "How Premium Event Coverage Builds Brand Memory | SV Live Events",
    seoDescription:
      "Learn how cinematic event coverage builds lasting brand memory for weddings, corporate events and live productions.",
    canonicalUrl: "/blog/how-premium-event-coverage-builds-brand-memory",
    ogImage: "/assets/blog/covers/brand-memory.png",
    buttonText: "Read Article",
    buttonLink: "#blog",
  },
  {
    id: 2,
    slug: "why-led-walls-transform-guest-experience",
    title: "Why LED Walls Transform Guest Experience Instantly",
    subtitle: "Stage clarity that guests feel",
    excerpt:
      "From stage clarity to immersive branding, LED walls reshape how guests feel the energy of a live room in real time.",
    content:
      "From stage clarity to immersive branding, LED walls reshape how guests feel the energy of a live room in real time.",
    category: "Production",
    author: "Suman Narsing",
    authorRole: "Founder, SV Live Events",
    authorImage: "/assets/blog/authors/suman-narsing.png",
    publishDate: "Apr 02, 2025",
    readingTime: "4 min",
    featuredImage: "/assets/blog/covers/led-walls.png",
    thumbnail: "/assets/blog/thumbnails/led-walls.png",
    gallery: ["/assets/blog/covers/led-walls.png"],
    video: null,
    tags: ["LED", "Production", "Stage"],
    featured: true,
    popular: true,
    seoTitle: "Why LED Walls Transform Guest Experience | SV Live Events",
    seoDescription:
      "Discover how LED walls elevate guest experience with immersive branding and stage clarity.",
    canonicalUrl: "/blog/why-led-walls-transform-guest-experience",
    ogImage: "/assets/blog/covers/led-walls.png",
    buttonText: "Read Article",
    buttonLink: "#blog",
  },
  {
    id: 3,
    slug: "the-new-standard-for-multi-camera-live-streaming",
    title: "The New Standard for Multi-Camera Live Streaming",
    subtitle: "Broadcast-grade hybrid events",
    excerpt:
      "Broadcast-grade switching, clean audio, and cinematic framing turn hybrid events into experiences people actually stay for.",
    content:
      "Broadcast-grade switching, clean audio, and cinematic framing turn hybrid events into experiences people actually stay for.",
    category: "Live Streaming",
    author: "Suman Narsing",
    authorRole: "Founder, SV Live Events",
    authorImage: "/assets/blog/authors/suman-narsing.png",
    publishDate: "Mar 12, 2025",
    readingTime: "6 min",
    featuredImage: "/assets/blog/covers/live-streaming.png",
    thumbnail: "/assets/blog/thumbnails/live-streaming.png",
    gallery: ["/assets/blog/covers/live-streaming.png"],
    video: null,
    tags: ["Live Streaming", "Broadcast", "Technology"],
    featured: true,
    popular: false,
    seoTitle: "Multi-Camera Live Streaming Standard | SV Live Events",
    seoDescription:
      "Explore broadcast-grade multi-camera live streaming for hybrid and large-format events.",
    canonicalUrl: "/blog/the-new-standard-for-multi-camera-live-streaming",
    ogImage: "/assets/blog/covers/live-streaming.png",
    buttonText: "Read Article",
    buttonLink: "#blog",
  },
];

/** Search / filter / sort helpers for future CMS UI */
export function getBlogJsonLd(post, siteUrl = "https://svliveevents.com") {
  if (!post) return null;
  const authorName =
    typeof post.author === "string" ? post.author : post.author?.name;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.ogImage || post.featuredImage || post.image,
    datePublished: post.publishDate || post.date,
    author: {
      "@type": "Person",
      name: authorName,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}${post.canonicalUrl || `/blog/${post.slug}`}`,
    },
  };
}

export function filterBlogPosts(
  list,
  { category, tag, author, query, sortBy = "date" } = {},
) {
  let result = list.filter((post) => {
    if (category && category !== "All" && post.category !== category) return false;
    if (tag && !(post.tags ?? []).includes(tag)) return false;
    if (author) {
      const name =
        typeof post.author === "string" ? post.author : post.author?.name;
      if (name !== author) return false;
    }
    if (query) {
      const q = String(query).toLowerCase();
      const hay = `${post.title} ${post.excerpt} ${(post.tags ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (sortBy === "popular") {
    result = [...result].sort((a, b) => Number(b.popular) - Number(a.popular));
  } else if (sortBy === "readingTime") {
    result = [...result].sort(
      (a, b) => parseInt(a.readingTime, 10) - parseInt(b.readingTime, 10),
    );
  }
  // date: keep source order (newest-first in data file)

  return result;
}

export default blogPosts;
