/**
 * Blog section configuration — CMS/API ready.
 * Swap for GET /api/blog/section when admin is ready.
 */
export const blogSection = {
  title: "Blog",
  subtitle: "Insight-led content for brands and",
  highlight: "event planners.",
  description:
    "Practical production insights for planners who want premium results without the guesswork — covering strategy, LED, livestream and cinematic storytelling.",
  /** Static import key — resolves to Portfolio.png cinematic BG (blur-ready) */
  backgroundImage: "portfolio",
  showFeatured: false,
  showDate: true,
  showReadingTime: false,
  showAuthor: true,
  showCategory: true,
  showTags: false,
  showCategoryFilter: false,
  showPagination: false,
  cardsPerRow: 3,
  autoplay: false,
  categories: [
    "All",
    "Strategy",
    "Production",
    "Photography",
    "Drone",
    "LED Screens",
    "Live Streaming",
    "Corporate",
    "Wedding",
    "Technology",
  ],
  cta: {
    icon: "Newspaper",
    title: "More insights. More inspiration.",
    description:
      "Explore our blog for expert tips on production, storytelling and event technology.",
    buttonText: "View All Articles",
    buttonLink: "#blog",
  },
  particles: [
    { left: "16%", bottom: "28%", delay: "0s", duration: "8s", color: "#fdb515" },
    { left: "34%", bottom: "44%", delay: "1.1s", duration: "9s", color: "#ff8a00" },
    { left: "52%", bottom: "32%", delay: "2s", duration: "7.5s", color: "#c084fc" },
    { left: "70%", bottom: "50%", delay: "0.7s", duration: "10s", color: "#fdb515" },
    { left: "84%", bottom: "36%", delay: "1.8s", duration: "8.5s", color: "#60a5fa" },
  ],
};

export default blogSection;
