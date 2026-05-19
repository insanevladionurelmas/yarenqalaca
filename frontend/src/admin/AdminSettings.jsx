import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useAdminAuth, formatApiError } from "./AuthContext.jsx";

export default function AdminSettings() {
  const { api } = useAdminAuth();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/site-settings").then(({ data }) => setS(data)).catch((e) => setErr(formatApiError(e))).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  if (loading || !s) return <div className="text-white/40 text-sm">Loading settings…</div>;

  const setField = (k, v) => setS({ ...s, [k]: v });
  const setNested = (k, sub, v) => setS({ ...s, [k]: { ...(s[k] || {}), [sub]: parseFloat(v) || 0 } });
  const setListVal = (k, i, sub, v) => {
    const list = [...(s[k] || [])];
    list[i] = { ...list[i], [sub]: sub === "value" ? parseFloat(v) || 0 : v };
    setS({ ...s, [k]: list });
  };

  const save = async () => {
    setSaving(true); setSaved(false); setErr("");
    try {
      const payload = {
        brands: s.brands,
        audience_gender_primary: s.audience_gender_primary,
        audience_gender_secondary: s.audience_gender_secondary,
        age_ranges: s.age_ranges,
        top_countries_audience: s.top_countries_audience,
        top_countries_location: s.top_countries_location,
        media_kit_cta_title: s.media_kit_cta_title,
        media_kit_cta_text: s.media_kit_cta_text,
        media_kit_cta_button: s.media_kit_cta_button,
      };
      const { data } = await api.put("/admin/site-settings", payload);
      setS(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (e) { setErr(formatApiError(e)); }
    finally { setSaving(false); }
  };

  return (
    <div data-testid="admin-settings-view" className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Site Settings</h2>
          <p className="text-xs text-white/45 mt-1">Editable: brands list, audience insights, top countries, age ranges, media kit CTA.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span data-testid="settings-saved" className="text-xs text-emerald-300">Saved</span>}
          <button onClick={save} disabled={saving} data-testid="settings-save-btn" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F0A89C] to-[#E1837A] text-[#1a1a1a] text-[10px] tracking-[0.22em] uppercase font-medium hover:brightness-110 transition-all disabled:opacity-50 inline-flex items-center gap-2">
            <Save className="w-3 h-3" /> {saving ? "..." : "Save changes"}
          </button>
        </div>
      </div>

      {err && <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">{err}</div>}

      {/* Brands */}
      <Card title="Brand collaborations">
        <textarea
          data-testid="settings-brands"
          rows={6}
          value={(s.brands || []).join("\n")}
          onChange={(e) => setField("brands", e.target.value.split("\n").map((b) => b.trim()).filter(Boolean))}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30 placeholder-white/30 resize-none"
          placeholder="One brand per line…"
        />
        <p className="text-xs text-white/40 mt-2">One brand per line. {s.brands?.length || 0} total.</p>
      </Card>

      {/* Gender */}
      <Card title="Gender split (primary)">
        <div className="grid grid-cols-3 gap-3">
          <Number label="Women %" testid="settings-gp-women" value={s.audience_gender_primary?.women ?? 0} onChange={(v) => setNested("audience_gender_primary", "women", v)} />
          <Number label="Men %" testid="settings-gp-men" value={s.audience_gender_primary?.men ?? 0} onChange={(v) => setNested("audience_gender_primary", "men", v)} />
          <Number label="Other %" testid="settings-gp-other" value={s.audience_gender_primary?.other ?? 0} onChange={(v) => setNested("audience_gender_primary", "other", v)} />
        </div>
      </Card>

      {/* Age ranges */}
      <Card title="Top age ranges">
        {(s.age_ranges || []).map((r, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 mb-3">
            <input value={r.label} onChange={(e) => setListVal("age_ranges", i, "label", e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30" data-testid={`settings-age-label-${i}`} />
            <input type="number" step="0.1" value={r.value} onChange={(e) => setListVal("age_ranges", i, "value", e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30" data-testid={`settings-age-value-${i}`} />
          </div>
        ))}
      </Card>

      {/* Top countries audience */}
      <Card title="Top countries (audience)">
        {(s.top_countries_audience || []).map((r, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 mb-3">
            <input value={r.name} onChange={(e) => setListVal("top_countries_audience", i, "name", e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30" />
            <input type="number" step="0.1" value={r.value} onChange={(e) => setListVal("top_countries_audience", i, "value", e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30" />
          </div>
        ))}
      </Card>

      {/* Top countries location */}
      <Card title="Top countries (location)">
        {(s.top_countries_location || []).map((r, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 mb-3">
            <input value={r.name} onChange={(e) => setListVal("top_countries_location", i, "name", e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30" />
            <input type="number" step="0.1" value={r.value} onChange={(e) => setListVal("top_countries_location", i, "value", e.target.value)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30" />
          </div>
        ))}
      </Card>

      {/* Media kit CTA */}
      <Card title="Media Kit CTA">
        <Input label="Title" testid="settings-mk-title" value={s.media_kit_cta_title || ""} onChange={(v) => setField("media_kit_cta_title", v)} />
        <Textarea label="Description text" testid="settings-mk-text" value={s.media_kit_cta_text || ""} onChange={(v) => setField("media_kit_cta_text", v)} />
        <Input label="Button label" testid="settings-mk-btn" value={s.media_kit_cta_button || ""} onChange={(v) => setField("media_kit_cta_button", v)} />
      </Card>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h3 className="text-[10px] tracking-[0.22em] uppercase text-white/55 mb-4">{title}</h3>
      {children}
    </div>
  );
}
function Number({ label, testid, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.22em] uppercase text-white/50 mb-1.5">{label}</span>
      <input type="number" step="0.1" data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30" />
    </label>
  );
}
function Input({ label, testid, value, onChange }) {
  return (
    <label className="block mt-3 first:mt-0">
      <span className="block text-[10px] tracking-[0.22em] uppercase text-white/50 mb-1.5">{label}</span>
      <input data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30" />
    </label>
  );
}
function Textarea({ label, testid, value, onChange }) {
  return (
    <label className="block mt-3">
      <span className="block text-[10px] tracking-[0.22em] uppercase text-white/50 mb-1.5">{label}</span>
      <textarea data-testid={testid} rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30 resize-none" />
    </label>
  );
}
