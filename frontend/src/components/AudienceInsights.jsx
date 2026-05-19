import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLang } from "../i18n.jsx";
import { useSiteSettings } from "../hooks/usePublicData.js";
import SectionHeading from "./SectionHeading.jsx";

function Bar({ label, value, max = 100, color = "primary", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1500;
    let raf;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(value * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    const tm = setTimeout(() => { raf = requestAnimationFrame(step); }, delay);
    return () => { clearTimeout(tm); if (raf) cancelAnimationFrame(raf); };
  }, [inView, value, delay]);

  const colorMap = {
    primary: "from-[rgb(var(--primary))] to-[rgb(var(--rose-gold))]",
    secondary: "from-[rgb(var(--secondary))] to-[rgb(var(--primary))]",
    lavender: "from-[rgb(var(--accent))] to-[rgb(var(--primary))]",
  };

  return (
    <div ref={ref} data-testid={`audience-bar-${String(label).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-[rgb(var(--foreground))]/75">{label}</span>
        <span className="font-serif text-lg text-[rgb(var(--foreground))]">{shown.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-[rgb(var(--surface))] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color] || colorMap.primary} transition-[width] duration-300`}
          style={{ width: `${(shown / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix }) {
  return (
    <div className="rounded-2xl glass-light p-5 md:p-6" data-testid={`audience-stat-${label.replace(/\s+/g, "-").toLowerCase()}`}>
      <div className="text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/55">{label}</div>
      <div className="mt-3 font-serif text-3xl md:text-4xl font-light text-[rgb(var(--foreground))]">
        {value}{suffix && <span className="text-[rgb(var(--rose-gold))] ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

export default function AudienceInsights() {
  const { t } = useLang();
  const s = useSiteSettings();
  const c = t.audience;
  const womenPct = s.audience_gender_primary?.women ?? 61;
  const menPct = s.audience_gender_primary?.men ?? 37;

  return (
    <section
      id="audience"
      data-testid="audience-section"
      className="relative py-24 md:py-32 bg-[rgb(var(--surface))] overflow-hidden"
    >
      <div className="grain absolute inset-0" />
      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12">
        <SectionHeading id="audience" eyebrow={c.eyebrow} title={c.titleEn} titleEn={c.title} sub={c.strategy} />

        {/* Top KPIs */}
        <div data-testid="audience-kpis" className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          <StatCard label="Female audience" value={womenPct} suffix="%" />
          <StatCard label="Age 18–34" value={(((s.age_ranges?.[0]?.value ?? 0) + (s.age_ranges?.[1]?.value ?? 0)) * 10 | 0) / 10} suffix="%" />
          <StatCard label="Turkey share" value={s.top_countries_audience?.[0]?.value ?? 91.3} suffix="%" />
          <StatCard label="International reach" value={(100 - (s.top_countries_audience?.[0]?.value ?? 91.3)).toFixed(1)} suffix="%" />
        </div>

        {/* Two-column dashboards */}
        <div className="mt-12 grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Gender + Age */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-[1.75rem] glass-light p-7 md:p-9"
            data-testid="audience-card-demographics"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl">Demographics</h3>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[rgb(var(--foreground))]/45">Verified</span>
            </div>

            <div className="space-y-7">
              <div>
                <div className="text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/55 mb-3">{c.genderTitle}</div>
                <div className="space-y-3">
                  <Bar label="Women" value={womenPct} delay={0} />
                  <Bar label="Men" value={menPct} delay={120} />
                  {s.audience_gender_primary?.other != null && (
                    <Bar label="Other" value={s.audience_gender_primary.other} delay={240} color="lavender" />
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/55 mb-3">{c.ageTitle}</div>
                <div className="space-y-3">
                  {(s.age_ranges || []).map((r, i) => (
                    <Bar key={r.label} label={r.label} value={r.value} delay={120 * i} color={i === 0 ? "primary" : "secondary"} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Geography */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="rounded-[1.75rem] glass-light p-7 md:p-9"
            data-testid="audience-card-geography"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl">Geography</h3>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[rgb(var(--foreground))]/45">Reach</span>
            </div>

            <div className="space-y-7">
              <div>
                <div className="text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/55 mb-3">{c.audienceCountries}</div>
                <div className="space-y-3">
                  {(s.top_countries_audience || []).map((co, i) => (
                    <Bar key={co.name} label={co.name} value={co.value} delay={i * 100} color={i === 0 ? "primary" : "secondary"} />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/55 mb-3">{c.locationCountries}</div>
                <div className="space-y-3">
                  {(s.top_countries_location || []).map((co, i) => (
                    <Bar key={co.name} label={co.name} value={co.value} delay={i * 100} color={i === 0 ? "primary" : "lavender"} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <p data-testid="audience-disclaimer" className="mt-8 text-center text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/40">
          Verified by platform analytics · Updated quarterly
        </p>
      </div>
    </section>
  );
}
