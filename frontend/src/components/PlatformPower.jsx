import React from "react";
import { motion } from "framer-motion";
import { Instagram, Music2, Youtube, Radio, ArrowUpRight, BadgeCheck } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { ASSETS, SOCIAL_LINKS } from "../assets.js";
import SectionHeading from "./SectionHeading.jsx";

const cardFade = {
  hidden: { opacity: 0, y: 40 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function PlatformPower() {
  const { t } = useLang();
  const p = t.platforms;

  return (
    <section
      id="platforms"
      data-testid="platforms-section"
      className="relative py-24 md:py-32 bg-[rgb(var(--background))]"
    >
      <div
        className="gradient-orb"
        style={{
          width: 600,
          height: 600,
          top: "10%",
          right: "-180px",
          background: "radial-gradient(circle, rgb(247,225,222) 0%, transparent 70%)",
          opacity: 0.4,
        }}
      />
      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12">
        <SectionHeading
          id="platforms"
          eyebrow={p.eyebrow}
          title={p.titleEn}
          titleEn={p.title}
          sub={p.sub}
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {/* Instagram */}
          <PlatformCard
            i={0}
            testid="platform-card-instagram"
            href={SOCIAL_LINKS.instagram}
            cta={p.instagram.cta}
            theme="instagram"
            data={p.instagram}
            icon={<Instagram className="w-5 h-5" />}
            bgImage={ASSETS.igScreenshot}
            accentClass="bg-gradient-to-br from-[rgb(var(--secondary))] via-[rgb(var(--background))] to-[rgb(var(--accent))]"
          />
          {/* TikTok */}
          <PlatformCard
            i={1}
            testid="platform-card-tiktok"
            href={SOCIAL_LINKS.tiktok}
            cta={p.tiktok.cta}
            theme="tiktok"
            data={p.tiktok}
            secondaryStat={{ v: p.tiktok.stat2, l: p.tiktok.statLabel2 }}
            icon={<Music2 className="w-5 h-5" />}
            bgImage={ASSETS.tiktokScreenshot}
            accentClass="bg-gradient-to-br from-[#FFF6F5] via-white to-[#F5EFEB]"
          />
          {/* YouTube */}
          <PlatformCard
            i={2}
            testid="platform-card-youtube"
            href={SOCIAL_LINKS.youtube}
            cta={p.youtube.cta}
            theme="youtube"
            data={p.youtube}
            icon={<Youtube className="w-5 h-5" />}
            bgImage={ASSETS.youtubeScreenshot}
            accentClass="bg-gradient-to-br from-[#F5EFEB] via-[#FAF6F2] to-[#FCEFE5]"
          />
          {/* Kick — dark frosted with elegant neon green */}
          <PlatformCard
            i={3}
            testid="platform-card-kick"
            href={SOCIAL_LINKS.kick}
            cta={p.kick.cta}
            theme="kick"
            data={p.kick}
            icon={<Radio className="w-5 h-5" />}
            bgImage={ASSETS.kickFrostedGreen}
            accentClass="bg-[#141416]"
          />
        </div>
      </div>
    </section>
  );
}

function PlatformCard({ i, testid, href, cta, theme, data, secondaryStat, icon, bgImage, accentClass }) {
  const isKick = theme === "kick";
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testid}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={cardFade}
      className={`group relative overflow-hidden rounded-[1.75rem] p-7 md:p-8 min-h-[460px] flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 ${accentClass} ${
        isKick ? "kick-glow" : "shadow-[0_8px_30px_rgba(45,36,34,0.06)] hover:shadow-[0_20px_50px_rgba(240,168,156,0.18)]"
      }`}
    >
      {/* Background visual */}
      <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-700">
        <img
          src={bgImage}
          alt=""
          className={`w-full h-full object-cover ${isKick ? "" : "scale-110 group-hover:scale-100 transition-transform duration-1000"}`}
        />
        <div className={`absolute inset-0 ${isKick ? "bg-[#141416]/85" : "bg-[rgb(var(--background))]/55 group-hover:bg-[rgb(var(--background))]/45 transition-colors"}`} />
      </div>

      {/* Top */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full grid place-items-center ${
            isKick
              ? "bg-[rgb(var(--kick-neon))]/15 text-[rgb(var(--kick-neon))] border border-[rgb(var(--kick-neon))]/30"
              : "bg-white/70 backdrop-blur-md text-[rgb(var(--foreground))] border border-white/80"
          }`}>
            {icon}
          </div>
          <div>
            <div className={`font-serif text-lg ${isKick ? "text-white" : "text-[rgb(var(--foreground))]"}`}>
              {data.name}
            </div>
            <div className={`text-[11px] tracking-[0.18em] uppercase flex items-center gap-1 ${
              isKick ? "text-[rgb(var(--kick-neon))]" : "text-[rgb(var(--rose-gold))]"
            }`}>
              <BadgeCheck className="w-3 h-3" /> {data.handle}
            </div>
          </div>
        </div>
        <ArrowUpRight className={`w-5 h-5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 ${
          isKick ? "text-[rgb(var(--kick-neon))]" : "text-[rgb(var(--foreground))]/40"
        }`} />
      </div>

      {/* Stat block */}
      <div className="relative z-10 mt-10">
        <div className={`font-serif font-light leading-none ${
          isKick ? "text-[rgb(var(--kick-neon))]" : "text-[rgb(var(--foreground))]"
        } text-[clamp(2.5rem,5vw,3.75rem)]`}>
          {data.stat}
        </div>
        <div className={`text-[11px] tracking-[0.22em] uppercase mt-2 ${
          isKick ? "text-white/55" : "text-[rgb(var(--foreground))]/55"
        }`}>
          {data.statLabel}
        </div>
        {secondaryStat && (
          <div className="mt-4 flex items-baseline gap-3">
            <span className={`font-serif text-2xl ${isKick ? "text-white" : "text-[rgb(var(--foreground))]"}`}>
              {secondaryStat.v}
            </span>
            <span className={`text-[10px] tracking-[0.22em] uppercase ${isKick ? "text-white/55" : "text-[rgb(var(--foreground))]/55"}`}>
              {secondaryStat.l}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="relative z-10 mt-8 space-y-4">
        <div className={`text-[11px] tracking-[0.2em] uppercase ${
          isKick ? "text-[rgb(var(--kick-neon))]/80" : "text-[rgb(var(--rose-gold))]/90"
        }`}>
          {data.tag}
        </div>
        <p className={`text-sm leading-relaxed font-light ${
          isKick ? "text-white/75" : "text-[rgb(var(--foreground))]/70"
        }`}>
          {data.desc}
        </p>
        <div className={`pt-5 mt-2 border-t flex items-center justify-between text-[11px] tracking-[0.18em] uppercase ${
          isKick ? "border-white/10 text-[rgb(var(--kick-neon))]" : "border-[rgb(var(--foreground))]/10 text-[rgb(var(--foreground))]"
        }`}>
          <span>{cta}</span>
          <span aria-hidden>→</span>
        </div>
      </div>
    </motion.a>
  );
}
