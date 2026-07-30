/**
 * Testimonials content array.
 * Swap for GET /api/testimonials — keep this shape.
 */
export const testimonials = [
  {
    id: 1,
    name: "Priya & Rahul",
    designation: "Wedding Client",
    company: "Hyderabad",
    location: "Hyderabad",
    image: "/assets/testimonials/clients/priya-rahul.png",
    rating: 5,
    review:
      "SV Live Events made our wedding feel like a film. The visuals, timing, and professionalism were exceptional from start to finish.",
    video: null,
    featured: true,
    eventType: "Wedding",
    eventDate: "2024",
    companyLogo: null,
  },
  {
    id: 2,
    name: "Rohan Mehta",
    designation: "Marketing Head",
    company: "ITC Hotels",
    location: "ITC Hotels",
    image: "/assets/testimonials/clients/rohan-mehta.png",
    rating: 5,
    review:
      "Their crew handled LED, live streaming, and content capture with the confidence of a major broadcast team. Everything felt premium.",
    video: null,
    featured: true,
    eventType: "Corporate",
    eventDate: "2024",
    companyLogo: null,
  },
  {
    id: 3,
    name: "Vikram Singh",
    designation: "Event Manager",
    company: "Sunburn Arena",
    location: "Sunburn Arena",
    image: "/assets/testimonials/clients/vikram-singh.png",
    rating: 5,
    review:
      "The stage visuals and live event execution were sharp, reliable, and audience-ready. They brought both technology and taste.",
    video: null,
    featured: true,
    eventType: "Concert",
    eventDate: "2024",
    companyLogo: null,
  },
  {
    id: 4,
    name: "Neha Kapoor",
    designation: "Producer",
    company: "Zee Entertainment",
    location: "Zee Entertainment",
    image: "/assets/testimonials/clients/neha-kapoor.png",
    rating: 5,
    review:
      "From drone coverage to final delivery, the team was precise, creative, and effortless to work with. Truly award-level production.",
    video: null,
    featured: true,
    eventType: "Broadcast",
    eventDate: "2024",
    companyLogo: null,
  },
];

/** Filter helpers for future admin/search UI — no visual change today */
export function filterTestimonials(list, { eventType, rating, company, query } = {}) {
  return list.filter((item) => {
    if (eventType && item.eventType !== eventType) return false;
    if (rating != null && item.rating < rating) return false;
    if (company && item.company !== company) return false;
    if (query) {
      const q = String(query).toLowerCase();
      if (!item.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export default testimonials;
