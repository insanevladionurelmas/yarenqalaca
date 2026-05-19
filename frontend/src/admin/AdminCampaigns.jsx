import React, { useEffect, useState } from "react";
import { Plus, X, Save, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { useAdminAuth, formatApiError } from "./AuthContext.jsx";

const CATEGORY_FALLBACK = [
  "Beauty", "Fashion", "Lifestyle", "Entertainment",
  "Personal Care", "Technology", "Streaming / Entertainment", "Other",
];

const EMPTY = {
  title: "", brand: "", category: "Beauty", image_url: "",
  link: "", description: "", featured: false, display_order: 0, visible: true,
};

export default function AdminCampaigns() {
  const { api } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(CATEGORY_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // {id?, ...fields}
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/campaigns");
      setItems(data);
    } catch (e) { setErr(formatApiError(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    api.get("/admin/campaign-categories").then(({ data }) => setCategories(data.categories)).catch(() => {});
    // eslint-disable-next-line
  }, []);

  const save = async (data) => {
    try {
      if (data.id) {
        const { id, created_at, ...patch } = data;
        await api.patch(`/admin/campaigns/${id}`, patch);
      } else {
        await api.post("/admin/campaigns", data);
      }
      setEditing(null);
      load();
    } catch (e) { alert(formatApiError(e)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this campaign?")) return;
    await api.delete(`/admin/campaigns/${id}`);
    load();
  };

  return (
    <div data-testid="admin-campaigns-view">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl">Campaign Portfolio</h2>
          <p className="text-xs text-white/45 mt-1">Manage what appears in the public campaign gallery.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} data-testid="campaign-new-btn" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0A89C] to-[#E1837A] text-[#1a1a1a] text-[10px] tracking-[0.22em] uppercase font-medium hover:brightness-110 transition-all">
          <Plus className="w-3 h-3" /> New campaign
        </button>
      </div>

      {err && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">{err}</div>}

      <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-[10px] tracking-[0.2em] uppercase text-white/45">
            <tr>
              <th className="text-left px-5 py-3 font-medium">#</th>
              <th className="text-left px-5 py-3 font-medium">Image</th>
              <th className="text-left px-5 py-3 font-medium">Title / Brand</th>
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-white/40">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-white/40">No campaigns yet — click "New campaign".</td></tr>
            ) : items.map((c) => (
              <tr key={c.id} data-testid={`campaign-row-${c.id}`} className="hover:bg-white/[0.025] cursor-pointer" onClick={() => setEditing(c)}>
                <td className="px-5 py-4 text-white/50">{c.display_order}</td>
                <td className="px-5 py-4">
                  {c.image_url ? (
                    <img src={c.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white/5 grid place-items-center text-white/30 text-[10px]">no img</div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-white flex items-center gap-2">
                    {c.title}
                    {c.featured && <Star className="w-3 h-3 text-[#F0A89C]" fill="currentColor" />}
                  </div>
                  <div className="text-xs text-white/45">{c.brand}</div>
                </td>
                <td className="px-5 py-4 text-white/65 text-xs">{c.category}</td>
                <td className="px-5 py-4">
                  {c.visible ? (
                    <span className="text-[10px] tracking-[0.18em] uppercase text-emerald-300 inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Visible
                    </span>
                  ) : (
                    <span className="text-[10px] tracking-[0.18em] uppercase text-white/40 inline-flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Hidden
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={(e) => { e.stopPropagation(); remove(c.id); }} data-testid={`campaign-delete-${c.id}`} className="p-1.5 rounded hover:bg-red-500/10 text-white/40 hover:text-red-300 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <CampaignModal
          data={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function CampaignModal({ data, categories, onClose, onSave }) {
  const [form, setForm] = useState(data);
  const [saving, setSaving] = useState(false);
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : (e.target.type === "number" ? +e.target.value : e.target.value) });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-md grid place-items-center p-4" onClick={onClose} data-testid="campaign-modal">
      <form onSubmit={submit} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#161413] border border-white/10 rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
        <h3 className="font-serif text-2xl mb-1">{form.id ? "Edit campaign" : "New campaign"}</h3>
        <p className="text-xs text-white/45 mb-6">All public campaign gallery entries.</p>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Title" testid="cm-title" value={form.title} onChange={upd("title")} required />
          <Input label="Brand" testid="cm-brand" value={form.brand} onChange={upd("brand")} required />
          <SelectField label="Category" testid="cm-category" value={form.category} onChange={upd("category")} options={categories} />
          <Input label="Display order" testid="cm-order" type="number" value={form.display_order} onChange={upd("display_order")} />
          <Input className="md:col-span-2" label="Image URL" testid="cm-image" value={form.image_url || ""} onChange={upd("image_url")} placeholder="Paste a hosted image URL (or leave empty for placeholder)" />
          <Input className="md:col-span-2" label="External link (Instagram / TikTok / YouTube)" testid="cm-link" value={form.link || ""} onChange={upd("link")} />
          <Textarea className="md:col-span-2" label="Short description" testid="cm-desc" value={form.description || ""} onChange={upd("description")} rows={3} />
          <Toggle label="Featured" testid="cm-featured" value={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
          <Toggle label="Visible on site" testid="cm-visible" value={form.visible} onChange={(v) => setForm({ ...form, visible: v })} />
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-xs tracking-[0.18em] uppercase text-white/55 hover:text-white px-3 py-2">Cancel</button>
          <button type="submit" data-testid="cm-save" disabled={saving} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F0A89C] to-[#E1837A] text-[#1a1a1a] text-[10px] tracking-[0.22em] uppercase font-medium hover:brightness-110 transition-all disabled:opacity-50 inline-flex items-center gap-2">
            <Save className="w-3 h-3" /> {saving ? "..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, testid, className = "", required, ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[10px] tracking-[0.22em] uppercase text-white/50 mb-1.5">{label}{required && " *"}</span>
      <input data-testid={testid} required={required} {...rest} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30 placeholder-white/30" />
    </label>
  );
}
function Textarea({ label, testid, className = "", rows = 3, ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[10px] tracking-[0.22em] uppercase text-white/50 mb-1.5">{label}</span>
      <textarea data-testid={testid} rows={rows} {...rest} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30 placeholder-white/30 resize-none" />
    </label>
  );
}
function SelectField({ label, testid, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.22em] uppercase text-white/50 mb-1.5">{label}</span>
      <select data-testid={testid} value={value} onChange={onChange} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30">
        {options.map((o) => <option key={o} value={o} className="bg-[#161413]">{o}</option>)}
      </select>
    </label>
  );
}
function Toggle({ label, testid, value, onChange }) {
  return (
    <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3">
      <span className="text-[11px] tracking-[0.18em] uppercase text-white/70">{label}</span>
      <button type="button" data-testid={testid} onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full transition-colors ${value ? "bg-[#F0A89C]" : "bg-white/15"} relative`}>
        <span className={`absolute top-0.5 ${value ? "left-5" : "left-0.5"} w-4 h-4 bg-white rounded-full transition-all`} />
      </button>
    </div>
  );
}
