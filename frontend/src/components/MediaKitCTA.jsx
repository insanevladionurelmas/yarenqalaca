import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileDown } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { useSiteSettings } from "../hooks/usePublicData.js";

export default function MediaKitCTA() {
  const { t } = useLang();
  const s = useSiteSettings();
  const tabIfMedia = () => {
    // Switch contact form to media_kit tab via a custom event if FinalCTA listens, else just scroll
    document.dispatchEvent(new CustomEvent("yapr:request-media-kit"));
  };

  return (
    <section
      id="mediakit-cta"
      data-testid="mediakit-cta-section"
      className="relative py-20 md:py-24 bg-[rgb(var(--background))] overflow-hidden"
    >
      <div
        className="gradient-orb"
        style={{
          width: 480, height: 480, left: "10%", top: "-10%",
          background: "radial-gradient(circle, rgb(230,224,248) 0%, transparent 70%)",
          opacity: 0.55,
        }}
      />
      <div className="relative max-w-[1100px] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="rounded-[2rem] glass-blush p-10 md:p-14 text-center md:text-left md:flex md:items-center md:justify-between gap-8"
        >
          <div className="max-w-xl mx-auto md:mx-0">
            <p className="text-[10px] tracking-[0.28em] uppercase text-[rgb(var(--rose-gold))] mb-3 flex items-center justify-center md:justify-start gap-2">
              <span className="w-6 h-px bg-[rgb(var(--rose-gold))]" />
              For Brand Managers
            </p>
            <h3 data-testid="mediakit-title" className="font-serif text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-[rgb(var(--foreground))]">
              {s.media_kit_cta_title || "Request Full Media Kit"}
            </h3>
            <p data-testid="mediakit-text" className="mt-5 text-[rgb(var(--foreground))]/70 leading-relaxed font-light">
              {s.media_kit_cta_text}
            </p>
          </div>
          <div className="mt-8 md:mt-0 flex-shrink-0">
            <a
              href="#contact"
              onClick={tabIfMedia}
              data-testid="mediakit-cta-btn"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full btn-primary text-[11px] tracking-[0.22em] uppercase"
            >
              <FileDown className="w-4 h-4" />
              {s.media_kit_cta_button || "Request Media Kit"}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
