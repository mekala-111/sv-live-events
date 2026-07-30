import { testimonials } from "./testimonialsData";
import { testimonialSection } from "./testimonialSection";

/**
 * Aggregated shape consumed by SiteContext / useSite().testimonials
 * Keeps backward-compatible fields used by the UI.
 */
export const testimonialData = {
  label: testimonialSection.title,
  heading: testimonialSection.subtitle,
  headingHighlight: testimonialSection.highlight,
  headingSuffix: testimonialSection.suffix,
  description: testimonialSection.description,
  backgroundImage: testimonialSection.backgroundImage,
  autoPlay: testimonialSection.autoplay,
  interval: testimonialSection.interval,
  brandsLabel: testimonialSection.brandsLabel,
  particles: testimonialSection.particles,
  section: testimonialSection,
  items: testimonials.map((item) => ({
    ...item,
    // aliases for existing UI fields
    client: item.name,
    role: item.designation,
    photo: item.image,
    stars: item.rating,
    text: item.review,
  })),
  cta: {
    icon: testimonialSection.cta.icon,
    title: testimonialSection.cta.title,
    text: testimonialSection.cta.description,
    buttonLabel: testimonialSection.cta.buttonText,
    buttonHref: testimonialSection.cta.buttonLink,
  },
};

export default testimonialData;
