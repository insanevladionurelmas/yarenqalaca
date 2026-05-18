import React from "react";
import { Instagram, Music2, Youtube, Radio, Mail } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { SOCIAL_LINKS } from "../assets.js";

const SOCIALS = [
  { key: "instagram", href: SOCIAL_LINKS.instagram, Icon: Instagram, label: "Instagram" },
  { key: "tiktok", href: SOCIAL_LINKS.tiktok, Icon: Music2, label: "TikTok" },
  { key: "youtube", href: SOCIAL_LINKS.youtube, Icon: Youtube, label: "YouTube" },
  { key: "kick", href: SOCIAL_LINKS.kick, Icon: Radio, label: "Kick" },
  { key: "email", href: SOCIAL_LINKS.email, Icon: Mail, label: "Email" },
];

export default function Footer() {
  const { t } = useLang();
  return (
    <footer
      data-testid="site-footer"
      className="relative bg-[rgb(var(--foreground))] text-[rgb(var(--background))] py-16 md:py-20"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="font-serif text-3xl md:text-4xl tracking-[0.08em] uppercase">
            Yaren <span className="italic font-light text-[rgb(var(--primary))]">Alaca</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-white/65 font-light leading-relaxed">
            {t.footer.tagline}
          </p>
          <a
            href={SOCIAL_LINKS.email}
            data-testid="footer-email-link"
            className="mt-6 inline-flex items-center gap-2 text-sm text-white/80 hover:text-[rgb(var(--primary))] transition-colors"
          >
            <Mail className="w-4 h-4" /> info@yarenalacapr.com
          </a>
        </div>

        <div className="md:col-span-4">
          <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 mb-4">
            Platforms
          </div>
          <ul className="space-y-2 text-sm">
            <li><a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--primary))] transition-colors">@yarenalaca — 1.3M+</a></li>
            <li><a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--primary))] transition-colors">@yarenalaca — 5.6M+ • 476M+ ❤</a></li>
            <li><a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--primary))] transition-colors">@YarenAlaca — 776K+</a></li>
            <li><a href={SOCIAL_LINKS.kick} target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--kick-neon))] transition-colors">kick.com/yarenalaca</a></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 mb-4">
            Follow
          </div>
          <div className="flex flex-wrap gap-3">
            {SOCIALS.map(({ key, href, Icon, label }) => (
              <a
                key={key}
                href={href}
                target={key === "email" ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={label}
                data-testid={`footer-social-${key}`}
                className="w-11 h-11 grid place-items-center rounded-full border border-white/15 hover:border-[rgb(var(--primary))] hover:text-[rgb(var(--primary))] transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] tracking-[0.2em] uppercase text-white/40">
        <div>© {new Date().getFullYear()} Yaren Alaca PR</div>
        <div>{t.footer.rights}</div>
      </div>
    </footer>
  );
}
