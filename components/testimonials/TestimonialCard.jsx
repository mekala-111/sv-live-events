"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import RatingStars from "./RatingStars";
import ClientInfo from "./ClientInfo";

function TestimonialCard({ item, config }) {
  const {
    showRating = true,
    showCompany = true,
    showLocation = true,
  } = config ?? {};

  return (
    <motion.article
      data-testimonials-card
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="testimonials-glass testimonials-card flex flex-col rounded-[24px] p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#fdb515]/35 bg-[#ff8a00]/10 text-[#fdb515]">
          <Quote className="h-4 w-4" strokeWidth={1.75} />
        </div>
        {showRating ? <RatingStars rating={item.rating ?? item.stars ?? 5} /> : null}
      </div>

      <p className="mt-5 flex-1 text-sm leading-7 text-white/80">
        “{item.review ?? item.text}”
      </p>

      <ClientInfo
        name={item.name}
        designation={item.designation ?? item.role}
        company={item.company}
        location={item.location}
        image={item.image ?? item.photo}
        companyLogo={item.companyLogo}
        showCompany={showCompany}
        showLocation={showLocation}
      />
    </motion.article>
  );
}

export default memo(TestimonialCard);
