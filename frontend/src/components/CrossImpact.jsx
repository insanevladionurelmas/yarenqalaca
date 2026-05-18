import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLang } from "../i18n.jsx";
import { ASSETS } from "../assets.js";
import SectionHeading from "./SectionHeading.jsx";

// Animated counter: parses leading numeric portion and animates it
function AnimatedStat({ value, label, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [shown, setShown] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const match = /^([\d.,]+)(.*)$/.exec(value);
    if (!match) {
      setShown(value);
      return;
    }
    const numericStr = match[1].replace(/,/g, "");
    const suffix = match[2];
    const target = parseFloat(numericStr);
    if (Number.isNaN(target)) {
      setShown(value);
      return;
    }
    const decimals = (numericStr.split(".")[1] || "").length;
    const duration = 1600;
    const start = performance.now();
    let raf;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      setShown(current.toFixed(decimals) + suffix);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [inView, value, delay]);

  return (
    <div ref={ref} data-testid={`impact-stat-${label.replace(/\s+/g, "-").toLowerCase()}`} className="border-t border-[rgb(var(--border))] pt-6">
      <div className="font-serif font-light leading-none text-[clamp(2.5rem,6vw,4.5rem)] text-[rgb(var(--foreground))]">
        {shown}
      </div>
      <div className="mt-3 text-[11px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/55">
        {label}
      </div>
    </div>
  );
}

export default function CrossImpact() {
  const { t } = useLang();
  const s = t.impact;
  return (
    <section
      id="impact"
      data-testid="impact-section"
      className="relative py-24 md:py-32 bg-[rgb(var(--surface))] overflow-hidden"
    >
      <div className="grain absolute inset-0" />
      <div
        className="gradient-orb"
        style={{
          width: 700, height: 700, left: "-200px", top: "20%",
          background: "radial-gradient(circle, rgb(247,225,222) 0%, transparent 70%)",
          opacity: 0.55,
        }}
      />
      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHeading
            id="impact"
            eyebrow={s.eyebrow}
            title={s.titleEn}
            titleEn={s.title}
            sub={s.body}
          />

          <ul data-testid="impact-bullets" className="mt-10 space-y-3 max-w-lg">
            {s.bullets.map((b, idx) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.08 * idx }}
                className="flex items-start gap-3 text-[rgb(var(--foreground))]/75"
              >
                <span className="mt-2 w-6 h-px bg-[rgb(var(--rose-gold))]/70 flex-shrink-0" />
                <span className="font-light">{b}</span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-14 grid grid-cols-2 gap-x-10 gap-y-10">
            {s.stats.map((st, i) => (
              <AnimatedStat key={st.l} value={st.v} label={st.l} delay={i * 100} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative aspect-[4/5] rounded-[1.75rem] overflow-hidden shadow-[0_30px_80px_-30px_rgba(45,36,34,0.3)]">
            <img
              src={ASSETS.impactEditorial}
              alt="Cross-platform editorial"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[rgb(var(--secondary))]/30 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-6 -left-6 glass-blush rounded-2xl px-6 py-4 max-w-[220px]">
            <div className="text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/60 mb-1">
              Editorial reach
            </div>
            <div className="font-serif text-xl">Vogue-grade visibility</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
