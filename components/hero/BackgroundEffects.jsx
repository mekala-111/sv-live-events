"use client";

import Image from "next/image";
import bgImage from "@/src/assets/bg.png";

export function BackgroundEffects({ backgroundVideoSrc } = {}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#050505]">
      {backgroundVideoSrc ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
        >
          <source src={backgroundVideoSrc} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={bgImage}
          alt=""
          fill
          priority
          loading="eager"
          placeholder="blur"
          className="object-cover object-[72%_center] scale-[1.02]"
          sizes="100vw"
        />
      )}

      {/* Left readability wash — keeps copy crisp over the scene */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,5,0.94) 0%, rgba(5,5,5,0.72) 34%, rgba(5,5,5,0.28) 62%, rgba(5,5,5,0.18) 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/55" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,5,5,0.45))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_42%,rgba(168,85,247,0.22),transparent_34%),radial-gradient(circle_at_18%_70%,rgba(255,138,0,0.14),transparent_28%)]" />
    </div>
  );
}
