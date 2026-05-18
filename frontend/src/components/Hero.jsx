import React from "react";
import { motion } from "framer-motion";
import { useLang } from "../i18n.jsx";
import { ASSETS } from "../assets.js";

export default function Hero() {
  const { t } = useLang();
  return (
    <section
      id="top"
      data-testid="hero-section"
      className="relative min-h-screen w-full overflow-hidden bg-[rgb(var(--background))]"
    >
      {/* Floating gradient orbs */}
      <div
        className="gradient-orb float-soft"
        style={{
          width: 520,
          height: 520,
          top: "-120px",
          left: "-100px",
          background:
            "radial-gradient(circle, rgb(247,225,222) 0%, transparent 70%)",
        }}
      />
      <div
        className="gradient-orb float-soft"
        style={{
          width: 460,
          height: 460,
          bottom: "-120px",
          right: "-80px",
          background:
            "radial-gradient(circle, rgb(230,224,248) 0%, transparent 70%)",
          animationDelay: "2s",
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-20 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left: Text */}
        <div className="lg:col-span-7 relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            data-testid="hero-eyebrow"
            className="text-[11px] md:text-xs tracking-[0.28em] uppercase text-[rgb(var(--foreground))]/60 mb-8"
          >
            <span className="inline-block w-8 h-px bg-[rgb(var(--rose-gold))] align-middle mr-3" />
            {t.hero.eyebrow}
          </motion.p>

          <h1
            data-testid="hero-title"
            className="font-serif font-light leading-[0.92] tracking-tight text-[18vw] sm:text-[14vw] md:text-[11vw] lg:text-[8.5vw]"
          >
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1 }}
              className="block text-[rgb(var(--foreground))]"
            >
              {t.hero.titleA}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25 }}
              className="block italic font-extralight text-[rgb(var(--primary))]"
            >
              {t.hero.titleB}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            data-testid="hero-subtitle"
            className="mt-8 max-w-xl text-base md:text-lg text-[rgb(var(--foreground))]/70 leading-relaxed font-light"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#platforms"
              data-testid="hero-cta-primary"
              className="px-7 py-3.5 rounded-full text-[12px] tracking-[0.18em] uppercase btn-primary"
            >
              {t.hero.cta1}
            </a>
            <a
              href="#contact"
              data-testid="hero-cta-secondary"
              className="px-7 py-3.5 rounded-full text-[12px] tracking-[0.18em] uppercase btn-ghost"
            >
              {t.hero.cta2}
            </a>
          </motion.div>

          {/* Quick platform stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            data-testid="hero-mini-stats"
            className="mt-16 grid grid-cols-4 gap-4 md:gap-8 max-w-xl"
          >
            {[
              { v: "1.3M+", l: "Instagram" },
              { v: "5.6M+", l: "TikTok" },
              { v: "776K+", l: "YouTube" },
              { v: "Live", l: "Kick" },
            ].map((s) => (
              <div key={s.l} className="border-l border-[rgb(var(--border))] pl-3">
                <div className="font-serif text-xl md:text-2xl text-[rgb(var(--foreground))]">{s.v}</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-[rgb(var(--foreground))]/55 mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="lg:col-span-5 relative z-10"
        >
          <div className="relative">
            {/* Frame */}
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-[2rem] overflow-hidden shadow-[0_30px_80px_-20px_rgba(45,36,34,0.25)]">
              <img
                src={ASSETS.portrait}
                alt="Yaren Alaca portrait"
                data-testid="hero-portrait"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
              {/* Soft warm wash */}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--secondary))]/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating verified badge */}
            <div
              data-testid="hero-verified-badge"
              className="absolute -bottom-6 -left-6 glass-light rounded-2xl px-5 py-3 flex items-center gap-3 float-soft"
              style={{ animationDelay: "1s" }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-[rgb(var(--foreground))]/60">
                  Verified
                </div>
                <div className="font-serif text-sm">4 Platforms</div>
              </div>
            </div>

            {/* Floating reach card */}
            <div
              data-testid="hero-reach-card"
              className="absolute -top-4 -right-4 glass-blush rounded-2xl px-5 py-3 float-soft"
              style={{ animationDelay: "2.5s" }}
            >
              <div className="text-[10px] tracking-[0.2em] uppercase text-[rgb(var(--foreground))]/60">
                Combined reach
              </div>
              <div className="font-serif text-xl md:text-2xl">7M+</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[rgb(var(--foreground))]/45">
        <span>{t.hero.scroll}</span>
        <span className="w-px h-10 bg-gradient-to-b from-[rgb(var(--foreground))]/40 to-transparent" />
      </div>
    </section>
  );
}
