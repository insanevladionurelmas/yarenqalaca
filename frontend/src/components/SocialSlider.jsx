import React from "react";
import { useLang } from "../i18n.jsx";
import { ASSETS } from "../assets.js";

// Premium horizontal sliders (marquee): platform highlights & social proof moments
export default function SocialSlider() {
  const { t } = useLang();

  const visuals = [
    { src: ASSETS.igScreenshot, label: "Instagram • 1.3M+" },
    { src: ASSETS.tiktokScreenshot, label: "TikTok • 5.6M+" },
    { src: ASSETS.youtubeScreenshot, label: "YouTube • 776K+" },
    { src: ASSETS.kickScreenshot, label: "Kick • Live" },
    { src: ASSETS.fashionEditorial, label: "Fashion Campaign" },
    { src: ASSETS.beautyClose, label: "Beauty Editorial" },
    { src: ASSETS.travelLuxury, label: "Travel Story" },
    { src: ASSETS.laSunset, label: "LA Lifestyle" },
  ];

  // Duplicate for infinite marquee
  const loop = [...visuals, ...visuals];

  return (
    <section
      data-testid="social-slider-section"
      className="relative py-24 md:py-28 bg-[rgb(var(--background))] overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mb-12">
        <p className="text-[11px] tracking-[0.28em] uppercase text-[rgb(var(--rose-gold))] font-medium mb-5 flex items-center gap-3">
          <span className="inline-block w-6 h-px bg-[rgb(var(--rose-gold))]" />
          {t.proof.eyebrow}
        </p>
        <h2 className="font-serif text-3xl md:text-5xl font-light leading-tight max-w-2xl text-[rgb(var(--foreground))]">
          {t.proof.title}
        </h2>
      </div>

      {/* Marquee row 1 */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-[rgb(var(--background))] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-[rgb(var(--background))] to-transparent pointer-events-none" />
        <div className="marquee-track flex gap-6 px-6">
          {loop.map((item, idx) => (
            <div
              key={`a-${idx}`}
              data-testid={`slider-item-${idx}`}
              className="relative shrink-0 w-[260px] md:w-[320px] aspect-[3/4] rounded-2xl overflow-hidden bg-[rgb(var(--surface))] group"
            >
              <img
                src={item.src}
                alt={item.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-[10px] tracking-[0.22em] uppercase text-white/65">Verified</div>
                <div className="font-serif text-base mt-1">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee row 2 (reverse-feeling slower) */}
      <div className="relative mt-6">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-[rgb(var(--background))] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-[rgb(var(--background))] to-transparent pointer-events-none" />
        <div className="marquee-track marquee-slow flex gap-6 px-6" style={{ animationDirection: "reverse" }}>
          {[...loop].reverse().map((item, idx) => (
            <div
              key={`b-${idx}`}
              className="relative shrink-0 w-[200px] md:w-[260px] aspect-[4/3] rounded-2xl overflow-hidden bg-[rgb(var(--surface))]"
            >
              <img
                src={item.src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[rgb(var(--background))]/15 group-hover:bg-transparent transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
