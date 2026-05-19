import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { useSiteSettings } from "../hooks/usePublicData.js";
import SectionHeading from "./SectionHeading.jsx";

export default function TrustedBrands() {
  const { t } = useLang();
  const { brands } = useSiteSettings();

  return (
    <section
      id="brands"
      data-testid="brands-section"
      className="relative py-24 md:py-32 bg-[rgb(var(--background))] overflow-hidden"
    >
      <div
        className="gradient-orb"
        style={{
          width: 520, height: 520, left: "50%", top: "-10%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgb(247,225,222) 0%, transparent 70%)",
          opacity: 0.4,
        }}
      />
      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12">
        <SectionHeading
          id="brands"
          eyebrow={t.brands.eyebrow}
          title={t.brands.titleEn}
          titleEn={t.brands.title}
          sub={t.brands.sub}
          align="center"
        />

        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(var(--secondary))]/40 border border-[rgb(var(--rose-gold))]/30 text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/70">
            <Sparkles className="w-3 h-3 text-[rgb(var(--rose-gold))]" />
            Selected Brand Ecosystem
          </span>
        </div>

        <div data-testid="brands-grid" className="mt-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {brands.map((b, i) => (
            <motion.div
              key={b}
              data-testid={`brand-card-${b.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 10) * 0.04 }}
              className="group relative h-24 md:h-28 rounded-2xl border border-[rgb(var(--border))] bg-white/60 backdrop-blur-sm grid place-items-center px-3 text-center hover:bg-white hover:shadow-[0_8px_30px_rgba(240,168,156,0.18)] hover:-translate-y-1 transition-all duration-500"
            >
              <span className="font-serif text-lg md:text-xl tracking-tight text-[rgb(var(--foreground))]/80 group-hover:text-[rgb(var(--foreground))] transition-colors leading-tight">
                {b}
              </span>
              <span className="absolute inset-x-6 bottom-3 h-px bg-gradient-to-r from-transparent via-[rgb(var(--rose-gold))]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        <p data-testid="brands-disclaimer" className="mt-10 text-center text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/40">
          Selected names — full collaboration history available in the media kit
        </p>
      </div>
    </section>
  );
}
