"use client";

import { memo } from "react";
import Image from "next/image";

function AuthorCard({ name, role, avatar, show = true }) {
  if (!show || !name) return null;

  return (
    <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
      {avatar ? (
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[#fdb515]/30">
          <Image
            src={avatar}
            alt={name}
            fill
            loading="lazy"
            className="object-cover"
            sizes="40px"
          />
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        {role ? (
          <p className="truncate text-[12px] text-white/50">{role}</p>
        ) : null}
      </div>
    </div>
  );
}

export default memo(AuthorCard);
