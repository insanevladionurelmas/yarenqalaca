import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { useCampaigns } from "../hooks/usePublicData.js";
import SectionHeading from "./SectionHeading.jsx";

const CATEGORY_COLOR = {
  Beauty: "from-pink-300/40 to-rose-200/30",
  Fashion: "from-stone-300/40 to-amber-200/30",
  Lifestyle: "from-amber-200/40 to-orange-200/30",
  Entertainment: "from-violet-300/40 to-pink-200/30",
  "Personal Care": "from-orange-200/40 to-amber-200/30",
  Technology: "from-blue-200/40 to-cyan-200/30",
  "Streaming / Entertainment": "from-indigo-300/40 to-violet-300/30",
  Other: "from-stone-200/40 to-neutral-200/30",
};

export default function CampaignPortfolio() {
  const { t } = useLang();
  const { campaigns, loading } = useCampaigns();
  const c = t.portfolio;

  return (
    <section
      id="portfolio"
      data-testid="portfolio-section"
      className="relative py-24 md:py-32 bg-[rgb(var(--background))]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <SectionHeading
          id="portfolio"
          eyebrow={c.eyebrow}
          title={c.titleEn}
          titleEn={c.title}
          sub={c.sub}
        />

        {loading ? (
          <div className="mt-16 text-center text-[rgb(var(--foreground))]/40 text-sm">Loading portfolio…</div>
        ) : campaigns.length === 0 ? (
          <div data-testid="portfolio-empty" className="mt-16 text-center text-[rgb(var(--foreground))]/45">
            Portfolio updates coming soon.
          </div>
        ) : (
          <div data-testid="portfolio-grid" className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((cam, i) => (
              <CampaignCard key={cam.id} cam={cam} i={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CampaignCard({ cam, i }) {
  const hasImage = !!cam.image_url;
  const Wrapper = cam.link ? "a" : "div";
  const linkProps = cam.link ? { href: cam.link, target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: (i % 6) * 0.08 }}
      data-testid={`portfolio-card-${cam.id}`}
    >
      <Wrapper
        {...linkProps}
        className={`group relative block aspect-[4/5] rounded-[1.75rem] overflow-hidden bg-[rgb(var(--surface))] ${cam.link ? "cursor-pointer" : ""}`}
      >
        {hasImage ? (
          <img
            src={cam.image_url}
            alt={cam.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_COLOR[cam.category] || CATEGORY_COLOR.Other}`}>
            <div className="absolute inset-0 grid place-items-center text-[rgb(var(--foreground))]/40">
              <div className="flex flex-col items-center gap-3">
                <ImageIcon className="w-8 h-8" />
                <span className="text-[10px] tracking-[0.22em] uppercase">Campaign visual coming soon</span>
              </div>
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--foreground))]/85 via-[rgb(var(--foreground))]/15 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase bg-white/80 backdrop-blur-md text-[rgb(var(--foreground))]/80 border border-white/50">
            {cam.category}
          </span>
          {cam.featured && (
            <span className="px-3 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase bg-[rgb(var(--rose-gold))]/90 text-white border border-[rgb(var(--rose-gold))]">
              Featured
            </span>
          )}
        </div>

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <div className="text-[10px] tracking-[0.24em] uppercase text-white/70 mb-2">{cam.brand}</div>
          <h3 className="font-serif text-xl md:text-2xl leading-tight">{cam.title}</h3>
          {cam.description && (
            <p className="mt-2 text-[12px] text-white/65 line-clamp-2 max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-700">
              {cam.description}
            </p>
          )}
          {cam.link && (
            <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] tracking-[0.22em] uppercase text-white border-b border-white/30 pb-1">
              View Campaign <ArrowUpRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </Wrapper>
    </motion.div>
  );
}
