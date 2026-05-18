import React from "react";
import { motion } from "framer-motion";
import { useLang } from "../i18n.jsx";
import { ASSETS } from "../assets.js";
import SectionHeading from "./SectionHeading.jsx";

export default function Categories() {
  const { t } = useLang();
  const c = t.categories;

  const images = [
    ASSETS.beautyMacro,
    ASSETS.fashionStudio,
    ASSETS.lifestyleSoft,
    ASSETS.entertainment,
    ASSETS.laSunset,
    ASSETS.livestream,
    ASSETS.youthCulture,
    ASSETS.viralTrend,
  ];

  return (
    <section
      id="categories"
      data-testid="categories-section"
      className="relative py-24 md:py-32 bg-[rgb(var(--background))]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <SectionHeading
          id="categories"
          eyebrow={c.eyebrow}
          title={c.titleEn}
          titleEn={c.title}
        />

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
          {c.items.map((item, i) => (
            <motion.a
              key={item.name}
              href="#campaigns"
              data-testid={`category-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group relative aspect-[4/5] rounded-[1.5rem] overflow-hidden cursor-pointer"
            >
              <img
                src={images[i % images.length]}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--foreground))]/85 via-[rgb(var(--foreground))]/30 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="text-[10px] tracking-[0.22em] uppercase text-white/70 mb-2 transition-opacity duration-500">
                  {item.tag}
                </div>
                <div className="font-serif text-2xl md:text-3xl text-white leading-tight">
                  {item.name}
                </div>
                <div className="mt-4 w-8 h-px bg-[rgb(var(--primary))] transition-all duration-500 group-hover:w-16" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
