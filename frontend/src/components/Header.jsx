import React, { useEffect, useState } from "react";
import { useLang } from "../i18n.jsx";

const NAV_ITEMS = [
  { key: "platforms", href: "#platforms" },
  { key: "audience", href: "#audience" },
  { key: "portfolio", href: "#portfolio" },
  { key: "campaigns", href: "#campaigns" },
  { key: "contact", href: "#contact" },
];

export default function Header() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[rgb(var(--background))]/75 backdrop-blur-2xl border-b border-[rgb(var(--border))]/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        <a
          href="#top"
          data-testid="brand-logo"
          className="font-serif text-xl md:text-2xl tracking-[0.18em] uppercase text-[rgb(var(--foreground))]"
        >
          Yaren <span className="italic font-light">Alaca</span>
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              data-testid={`nav-link-${item.key}`}
              className="text-[13px] tracking-[0.16em] uppercase text-[rgb(var(--foreground))]/75 hover:text-[rgb(var(--foreground))] transition-colors duration-300"
            >
              {t.nav[item.key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          {/* Language toggle */}
          <div
            data-testid="lang-toggle"
            className="flex items-center gap-1 text-[12px] tracking-[0.2em] font-medium"
          >
            <button
              data-testid="lang-toggle-en"
              onClick={() => setLang("en")}
              className={`px-1 transition-opacity ${
                lang === "en" ? "opacity-100 text-[rgb(var(--foreground))]" : "opacity-40 hover:opacity-70"
              }`}
            >
              EN
            </button>
            <span className="opacity-30">|</span>
            <button
              data-testid="lang-toggle-tr"
              onClick={() => setLang("tr")}
              className={`px-1 transition-opacity ${
                lang === "tr" ? "opacity-100 text-[rgb(var(--foreground))]" : "opacity-40 hover:opacity-70"
              }`}
            >
              TR
            </button>
          </div>

          <a
            href="#contact"
            data-testid="header-cta-btn"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] tracking-[0.16em] uppercase btn-primary"
          >
            {t.nav.cta}
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </header>
  );
}
