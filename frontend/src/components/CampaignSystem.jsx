import React from "react";
import { motion } from "framer-motion";
import { useLang } from "../i18n.jsx";
import { ASSETS } from "../assets.js";
import SectionHeading from "./SectionHeading.jsx";

export default function CampaignSystem() {
  const { t } = useLang();
  const c = t.campaigns;

  const images = [
    ASSETS.beautyClose,
    ASSETS.viralTrend,
    ASSETS.travelLuxury,
    ASSETS.livestream,
    ASSETS.blushAbstract,
    ASSETS.champagne,
  ];

  return (
    <section
      id="campaigns"
      data-testid="campaigns-section"
      className="relative py-24 md:py-32 bg-[rgb(var(--surface))] overflow-hidden"
    >
      <div className="grain absolute inset-0" />
      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12">
        <SectionHeading
          id="campaigns"
          eyebrow={c.eyebrow}
          title={c.titleEn}
          titleEn={c.title}
          sub={c.sub}
        />

        <div className="mt-20 space-y-20 md:space-y-32">
          {c.steps.map((step, i) => {
            const reverse = i % 2 === 1;
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                data-testid={`campaign-step-${step.n}`}
                className={`grid lg:grid-cols-12 gap-8 lg:gap-16 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="lg:col-span-6">
                  <div className="relative aspect-[5/4] rounded-[1.75rem] overflow-hidden">
                    <img
                      src={images[i]}
                      alt={step.t}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[rgb(var(--secondary))]/30" />
                    <div className="absolute top-6 left-6 glass-light rounded-full px-4 py-1.5 text-[10px] tracking-[0.22em] uppercase">
                      Step {step.n}
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-6">
                  <div className="font-serif text-7xl md:text-8xl font-extralight text-[rgb(var(--primary))]/40 leading-none">
                    {step.n}
                  </div>
                  <h3 className="mt-4 font-serif text-3xl md:text-4xl font-light leading-tight text-[rgb(var(--foreground))]">
                    {step.t}
                  </h3>
                  <p className="mt-5 text-base md:text-lg text-[rgb(var(--foreground))]/65 leading-relaxed font-light max-w-md">
                    {step.d}
                  </p>
                  <div className="mt-8 editorial-divider w-32" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
