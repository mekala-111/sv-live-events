/**
 * Testimonials section configuration.
 * Swap for GET /api/testimonials/section when admin is ready.
 */
export const testimonialSection = {
  title: "Testimonials",
  subtitle: "Trust built through",
  highlight: "premium",
  suffix: "execution.",
  description:
    "Real feedback from clients who trusted SV Live Events to capture, stream, and elevate their most important moments.",
  backgroundImage: "@/src/assets/Portfolio.png",
  brandsLabel: "Trusted by leading brands",
  autoplay: true,
  interval: 4500,
  pauseOnHover: true,
  infinite: true,
  showRating: true,
  showCompany: true,
  showLocation: true,
  showNavigation: true,
  showPagination: false,
  showAutoPlayToggle: true,
  cta: {
    icon: "Shield",
    title: "Your event deserves the best. Let's create something extraordinary together.",
    description: "From concept to completion, we ensure a seamless and unforgettable experience.",
    buttonText: "Let's Work Together",
    buttonLink: "#book-now",
    background: null,
  },
  particles: [
    { left: "14%", bottom: "30%", delay: "0s", duration: "8s", color: "#fdb515" },
    { left: "32%", bottom: "44%", delay: "1.2s", duration: "9s", color: "#ff8a00" },
    { left: "55%", bottom: "36%", delay: "0.6s", duration: "7.5s", color: "#c084fc" },
    { left: "72%", bottom: "50%", delay: "1.8s", duration: "10s", color: "#fdb515" },
    { left: "86%", bottom: "28%", delay: "2.4s", duration: "8.5s", color: "#60a5fa" },
  ],
};

export default testimonialSection;
