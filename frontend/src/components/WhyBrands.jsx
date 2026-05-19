import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { useSiteSettings } from "../hooks/usePublicData.js";
import { ASSETS } from "../assets.js";
import SectionHeading from "./SectionHeading.jsx";

export default function WhyBrands() {
  const { t } = useLang();
  const w = t.why;
  const s = useSiteSettings();

  return (
    <section
      id="why"
      data-testid="why-section"
      className="relative py-24 md:py-32 bg-[rgb(var(--surface))] overflow-hidden"
    >
      <div
        className="gradient-orb"
        style={{
          width: 600, height: 600, right: "-200px", bottom: "10%",
          background: "radial-gradient(circle, rgb(247,225,222) 0%, transparent 70%)",
          opacity: 0.5,
        }}
      />
      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="lg:col-span-5"
        >
          <div className="relative aspect-[4/5] rounded-[1.75rem] overflow-hidden shadow-[0_30px_80px_-30px_rgba(45,36,34,0.3)]">
            <img src={ASSETS.portrait} alt="Yaren Alaca editorial" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[rgb(var(--secondary))]/30 via-transparent to-transparent" />
          </div>
          <div className="absolute -mt-8 ml-6 glass-blush rounded-2xl px-5 py-3 max-w-[260px]">
            <div className="text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/55">Trusted by</div>
            <div className="font-serif text-lg">{s.brands?.length || 21}+ global brands</div>
          </div>
        </motion.div>

        <div className="lg:col-span-7">
          <SectionHeading id="why" eyebrow={w.eyebrow} title={w.titleEn} titleEn={w.title} />

          <ul data-testid="why-list" className="mt-12 grid sm:grid-cols-2 gap-x-8 gap-y-5">
            {w.bullets.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                className="flex items-start gap-3 group"
              >
                <span className="mt-1 w-6 h-6 rounded-full bg-[rgb(var(--secondary))] grid place-items-center text-[rgb(var(--rose-gold))] flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </span>
                <span className="text-[rgb(var(--foreground))]/80 leading-relaxed font-light">{b}</span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-14 flex flex-wrap items-center gap-4">
            <a href="#contact" data-testid="why-cta-collab" className="px-6 py-3 rounded-full btn-primary text-[11px] tracking-[0.2em] uppercase inline-flex items-center gap-2">
              {w.ctaCollab} <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a href="#contact" data-testid="why-cta-media" className="px-6 py-3 rounded-full btn-ghost text-[11px] tracking-[0.2em] uppercase">
              {w.ctaMedia}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
