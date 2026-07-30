/**
 * Global site configuration.
 * Swap this module for GET /api/site without changing UI components.
 */
export const siteConfig = {
  companyName: "SV LIVE EVENTS",
  companyNameHtml: {
    prefix: "SV ",
    highlight: "LIVE",
    suffix: " EVENTS",
  },
  owner: "Suman Narsing",
  tagline: "Event Production",
  description:
    "Professional. Premium. Technology-first media production for unforgettable events.",
  phone: "9397364040",
  phoneHref: "tel:9397364040",
  email: "svliveevents@gmail.com",
  emailHref: "mailto:svliveevents@gmail.com",
  whatsapp: "919397364040",
  whatsappHref: "https://wa.me/919397364040",
  address: "Available Anywhere",
  businessHours: "24/7 Support Available",
  logo: "/assets/logos/logo-sm.png",
  logoSrcImport: "@/src/assets/logo-sm.png",
  social: {
    instagram: "#",
    facebook: "#",
    youtube: "#",
    whatsapp: "https://wa.me/919397364040",
  },
  seo: {
    title: "SV Live Events | Premium Media Production & Live Event Coverage",
    description:
      "SV Live Events delivers premium photography, live streaming, drone, LED wall, and cinematic event production services for weddings, corporate events, concerts, and large-format experiences.",
    keywords: [
      "SV Live Events",
      "media production company",
      "live streaming",
      "drone photography",
      "LED wall",
      "event coverage",
      "wedding photography",
      "corporate events",
    ],
    ogTitle: "SV Live Events",
    ogDescription:
      "Luxury event visuals, premium live production, and technology-first storytelling.",
  },
  nav: [
    "Home",
    "About",
    "Services",
    "Portfolio",
    "Packages",
    "Clients",
    "Testimonials",
    "Blog",
    "Contact",
  ],
  platform: {
    login: "/login",
    booking: "/booking",
    liveDemo: "/live/rahul-priya-wedding",
  },
  theme: {
    background: "#050505",
    primary: "#FDB515",
    secondary: "#FF8A00",
    purple: "#6B21A8",
    blue: "#2563EB",
  },
  assets: {
    backgrounds: {
      hero: "/assets/bg.png",
      about: "/assets/aboutus.png",
      services: "/assets/bg.png",
      portfolio: "/assets/Portfolio.png",
      whyChoose: "/assets/Portfolio.png",
      process: "/assets/Portfolio.png",
    },
  },
};

export default siteConfig;
