import { siteConfig } from "./siteConfig";
import { heroData } from "./heroData";
import { aboutData } from "./aboutData";
import { servicesData } from "./servicesData";
import { portfolioData } from "./portfolioData";
import { processData } from "./processData";
import { whyChooseData } from "./whyChooseData";
import { packageData } from "./packageData";
import { testimonialData } from "./testimonialData";
import { testimonials } from "./testimonialsData";
import { testimonialSection } from "./testimonialSection";
import { faqData } from "./faqData";
import { clientData } from "./clientData";
import { footerData } from "./footerData";
import { contactData } from "./contactData";
import { blogData, blogPosts, blogSection } from "./blogData";
import { bookNowData } from "./bookNowData";
import { loginData } from "./loginData";

/**
 * Aggregated landing content.
 * Replace `getSiteData()` body with `fetch('/api/site').then(r => r.json())`
 * when the admin API is ready — UI components stay unchanged.
 */
export function getSiteData() {
  return {
    site: siteConfig,
    hero: heroData,
    about: aboutData,
    services: servicesData,
    portfolio: portfolioData,
    process: processData,
    whyChoose: whyChooseData,
    packages: packageData,
    testimonials: testimonialData,
    faq: faqData,
    clients: clientData,
    footer: footerData,
    contact: contactData,
    blog: blogData,
  };
}

export {
  siteConfig,
  heroData,
  aboutData,
  servicesData,
  portfolioData,
  processData,
  whyChooseData,
  packageData,
  testimonialData,
  testimonials,
  testimonialSection,
  faqData,
  clientData,
  footerData,
  contactData,
  blogData,
  blogPosts,
  blogSection,
  bookNowData,
  loginData,
};
