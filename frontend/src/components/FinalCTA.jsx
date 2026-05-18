import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Mail, Send, Sparkles } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { ASSETS, SOCIAL_LINKS } from "../assets.js";
import SectionHeading from "./SectionHeading.jsx";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function FinalCTA() {
  const { t } = useLang();
  const c = t.cta;
  const [tab, setTab] = useState("collaboration"); // "collaboration" | "media_kit"
  const [form, setForm] = useState({ name: "", brand: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState({ loading: false, ok: null, err: null });

  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, ok: null, err: null });
    try {
      await axios.post(`${API}/leads`, { ...form, type: tab });
      setStatus({ loading: false, ok: true, err: null });
      setForm({ name: "", brand: "", email: "", phone: "", message: "" });
    } catch (err) {
      setStatus({ loading: false, ok: null, err: c.error });
    }
  };

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="relative py-24 md:py-32 bg-[rgb(var(--background))] overflow-hidden"
    >
      <div
        className="gradient-orb"
        style={{
          width: 600, height: 600, right: "-160px", bottom: "5%",
          background: "radial-gradient(circle, rgb(247,225,222) 0%, transparent 70%)",
          opacity: 0.6,
        }}
      />
      <div
        className="gradient-orb"
        style={{
          width: 500, height: 500, left: "-140px", top: "10%",
          background: "radial-gradient(circle, rgb(230,224,248) 0%, transparent 70%)",
          opacity: 0.5,
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-5">
          <SectionHeading
            id="contact"
            eyebrow={c.eyebrow}
            title={c.titleEn}
            titleEn={c.title}
            sub={c.sub}
          />

          <div className="mt-10 space-y-4">
            <a
              href={SOCIAL_LINKS.email}
              data-testid="contact-email-link"
              className="group flex items-center gap-4 px-5 py-4 rounded-2xl glass-light hover:glass-blush transition-all duration-500"
            >
              <span className="w-10 h-10 grid place-items-center rounded-full bg-[rgb(var(--primary))]/15 text-[rgb(var(--foreground))]">
                <Mail className="w-4 h-4" />
              </span>
              <div className="flex-1">
                <div className="text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/55">
                  {c.orEmail}
                </div>
                <div className="font-serif text-lg text-[rgb(var(--foreground))]">
                  info@yarenalacapr.com
                </div>
              </div>
              <span className="text-[rgb(var(--foreground))]/40 group-hover:translate-x-1 transition-transform">→</span>
            </a>

            <div className="relative aspect-[5/4] rounded-2xl overflow-hidden mt-6">
              <img src={ASSETS.beautyClose} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[rgb(var(--secondary))]/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          data-testid="contact-form-card"
          className="lg:col-span-7 relative rounded-[2rem] p-8 md:p-12 glass-light"
        >
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-8 p-1 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] w-fit">
            <button
              type="button"
              data-testid="tab-collaboration"
              onClick={() => { setTab("collaboration"); setStatus({ loading: false, ok: null, err: null }); }}
              className={`px-5 py-2.5 rounded-full text-[11px] tracking-[0.2em] uppercase transition-all ${
                tab === "collaboration" ? "bg-[rgb(var(--foreground))] text-[rgb(var(--background))]" : "text-[rgb(var(--foreground))]/60 hover:text-[rgb(var(--foreground))]"
              }`}
            >
              {c.tabCollab}
            </button>
            <button
              type="button"
              data-testid="tab-media-kit"
              onClick={() => { setTab("media_kit"); setStatus({ loading: false, ok: null, err: null }); }}
              className={`px-5 py-2.5 rounded-full text-[11px] tracking-[0.2em] uppercase transition-all ${
                tab === "media_kit" ? "bg-[rgb(var(--foreground))] text-[rgb(var(--background))]" : "text-[rgb(var(--foreground))]/60 hover:text-[rgb(var(--foreground))]"
              }`}
            >
              {c.tabMedia}
            </button>
          </div>

          <form onSubmit={submit} className="grid md:grid-cols-2 gap-5" data-testid="contact-form">
            <Field label={c.fName} testid="form-input-name" value={form.name} onChange={handle("name")} required />
            <Field label={c.fBrand} testid="form-input-brand" value={form.brand} onChange={handle("brand")} />
            <Field label={c.fEmail} testid="form-input-email" type="email" value={form.email} onChange={handle("email")} required />
            <Field label={c.fPhone} testid="form-input-phone" value={form.phone} onChange={handle("phone")} />
            <div className="md:col-span-2">
              <Field label={c.fMessage} testid="form-input-message" textarea value={form.message} onChange={handle("message")} required={tab === "collaboration"} />
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-4 mt-2">
              <p className="text-xs text-[rgb(var(--foreground))]/50 max-w-xs">
                <Sparkles className="w-3 h-3 inline-block mr-1 text-[rgb(var(--rose-gold))]" />
                We reply to qualified brand inquiries within 48 hours.
              </p>
              <button
                type="submit"
                data-testid="form-submit-btn"
                disabled={status.loading}
                className="px-7 py-3.5 rounded-full text-[11px] tracking-[0.2em] uppercase btn-primary inline-flex items-center gap-2 disabled:opacity-50"
              >
                {status.loading ? "..." : (tab === "collaboration" ? c.fSubmitCollab : c.fSubmitMedia)}
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {status.ok && (
              <div data-testid="form-success" className="md:col-span-2 mt-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                {tab === "collaboration" ? c.successCollab : c.successMedia}
              </div>
            )}
            {status.err && (
              <div data-testid="form-error" className="md:col-span-2 mt-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {status.err}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}

function Field({ label, testid, type = "text", value, onChange, required, textarea }) {
  const base = "w-full bg-transparent border-b border-[rgb(var(--border))] focus:border-[rgb(var(--primary))] outline-none py-3 text-sm text-[rgb(var(--foreground))] placeholder-transparent peer transition-colors";
  return (
    <label className="relative block">
      {textarea ? (
        <textarea
          rows={3}
          required={required}
          value={value}
          onChange={onChange}
          data-testid={testid}
          placeholder={label}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          data-testid={testid}
          placeholder={label}
          className={base}
        />
      )}
      <span className="pointer-events-none absolute left-0 -top-1 text-[10px] tracking-[0.22em] uppercase text-[rgb(var(--foreground))]/45 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-xs peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[rgb(var(--foreground))]/35 peer-focus:-top-1 peer-focus:text-[10px] peer-focus:tracking-[0.22em] peer-focus:text-[rgb(var(--rose-gold))]">
        {label}
      </span>
    </label>
  );
}
