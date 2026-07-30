import { blogPosts } from "./blogPosts";
import { blogSection } from "./blogSection";

/**
 * Aggregated shape for SiteContext / useSite().blog
 * Keeps UI-compatible aliases while exposing full CMS fields.
 */
export const blogData = {
  label: blogSection.title,
  heading: blogSection.subtitle,
  headingHighlight: blogSection.highlight,
  description: blogSection.description,
  excerpt: blogSection.description,
  backgroundImage: blogSection.backgroundImage,
  section: blogSection,
  posts: blogPosts.map((post) => ({
    ...post,
    tag: post.category,
    date: post.publishDate,
    image: post.featuredImage || post.thumbnail,
    href: post.buttonLink,
    author: {
      name: post.author,
      role: post.authorRole,
      avatar: post.authorImage,
    },
  })),
  cta: {
    icon: blogSection.cta.icon,
    title: blogSection.cta.title,
    text: blogSection.cta.description,
    buttonLabel: blogSection.cta.buttonText,
    buttonHref: blogSection.cta.buttonLink,
  },
};

export { blogPosts } from "./blogPosts";
export { blogSection } from "./blogSection";
export default blogData;
