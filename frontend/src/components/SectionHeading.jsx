import React from "react";
import { motion } from "framer-motion";

export default function SectionHeading({ eyebrow, title, titleEn, sub, align = "left", id }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      data-testid={id ? `${id}-heading` : "section-heading"}
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {eyebrow && (
        <p className="text-[11px] tracking-[0.28em] uppercase text-[rgb(var(--rose-gold))] font-medium mb-6 flex items-center gap-3">
          <span className="inline-block w-6 h-px bg-[rgb(var(--rose-gold))]" />
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight text-[rgb(var(--foreground))]">
          {title}
        </h2>
      )}
      {titleEn && (
        <h3 className="font-serif italic text-2xl md:text-3xl font-extralight text-[rgb(var(--foreground))]/55 mt-3">
          {titleEn}
        </h3>
      )}
      {sub && (
        <p className="mt-6 text-base md:text-lg text-[rgb(var(--foreground))]/65 leading-relaxed max-w-xl font-light">
          {sub}
        </p>
      )}
    </motion.div>
  );
}
