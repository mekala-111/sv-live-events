"use client";

import { memo } from "react";
import Image from "next/image";

function ClientInfo({
  name,
  designation,
  company,
  location,
  image,
  companyLogo,
  showCompany = true,
  showLocation = true,
}) {
  const meta = showLocation ? location || company : showCompany ? company : null;

  return (
    <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
      <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[#fdb515]/30">
        <Image
          src={image}
          alt={name}
          fill
          loading="lazy"
          className="object-cover"
          sizes="44px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-sm font-semibold text-white">{name}</p>
        {designation ? (
          <p className="truncate text-[12px] text-white/55">{designation}</p>
        ) : null}
        {meta ? (
          <p className="truncate text-[12px] font-medium text-[#fdb515]">{meta}</p>
        ) : null}
      </div>
      {companyLogo ? (
        <div className="relative h-8 w-16 shrink-0 opacity-70">
          <Image src={companyLogo} alt={company || ""} fill loading="lazy" className="object-contain" sizes="64px" />
        </div>
      ) : null}
    </div>
  );
}

export default memo(ClientInfo);
