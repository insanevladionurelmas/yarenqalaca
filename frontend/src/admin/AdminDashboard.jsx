import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAdminAuth, formatApiError } from "./AuthContext.jsx";
import AdminCampaigns from "./AdminCampaigns.jsx";
import AdminSettings from "./AdminSettings.jsx";
import {
  LogOut, Search, Download, Mail, Phone, X, Trash2,
  Filter, Tag, Flame, RefreshCw, ChevronDown,
} from "lucide-react";

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "collaboration", label: "Collaboration" },
  { value: "media_kit", label: "Media Kit" },
];
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
];

const STATUS_COLOR = {
  new: "bg-[#F0A89C]/15 text-[#F0A89C] border-[#F0A89C]/30",
  contacted: "bg-blue-400/15 text-blue-300 border-blue-400/30",
  qualified: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  closed: "bg-white/10 text-white/55 border-white/15",
};

function fmt(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleString("en-GB", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return String(d); }
}

export default function AdminDashboard() {
  const { admin, logout, api } = useAdminAuth();
  const [view, setView] = useState("leads"); // "leads" | "campaigns" | "settings"
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      if (filterTag) params.tag = filterTag;
      if (search) params.q = search;
      const { data } = await api.get("/admin/leads", { params });
      setLeads(data);
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [api, filterType, filterStatus, filterTag, search]);

  const loadStats = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/leads/stats");
      setStats(data);
    } catch {}
  }, [api]);

  useEffect(() => {
    loadLeads();
    loadStats();
  }, [loadLeads, loadStats]);

  useEffect(() => {
    api.get("/admin/tags").then(({ data }) => setAllTags(data.tags)).catch(() => {});
  }, [api]);

  const exportCsv = () => {
    const token = localStorage.getItem("yapr_admin_token");
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/admin/leads/export.csv`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `yarenalaca-leads-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  };

  const updateLead = async (leadId, patch) => {
    const { data } = await api.patch(`/admin/leads/${leadId}`, patch);
    setLeads((curr) => curr.map((l) => (l.id === leadId ? data : l)));
    if (selected?.id === leadId) setSelected(data);
    loadStats();
    return data;
  };

  const deleteLead = async (leadId) => {
    if (!window.confirm("Delete this lead permanently?")) return;
    await api.delete(`/admin/leads/${leadId}`);
    setLeads((curr) => curr.filter((l) => l.id !== leadId));
    if (selected?.id === leadId) setSelected(null);
    loadStats();
  };

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "Total", value: stats.total, color: "from-white/10 to-white/5" },
      { label: "New", value: stats.new, color: "from-[#F0A89C]/25 to-[#F0A89C]/5" },
      { label: "Hot Leads", value: stats.hot, color: "from-rose-500/25 to-rose-500/5", icon: <Flame className="w-3 h-3" /> },
      { label: "Contacted", value: stats.contacted, color: "from-blue-400/25 to-blue-400/5" },
      { label: "Qualified", value: stats.qualified, color: "from-emerald-400/25 to-emerald-400/5" },
      { label: "Collaboration", value: stats.collaboration, color: "from-amber-300/25 to-amber-300/5" },
      { label: "Media Kit", value: stats.media_kit, color: "from-violet-400/25 to-violet-400/5" },
    ];
  }, [stats]);

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-[#0F0E0D] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#0F0E0D]/80 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="font-serif text-lg tracking-[0.18em] uppercase">
              Yaren <span className="italic text-[#F0A89C] font-light">Alaca</span>
            </div>
            <span className="text-[10px] tracking-[0.22em] uppercase text-white/40 border-l border-white/10 pl-3">Admin Console</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/55 hidden sm:inline">{admin?.email}</span>
            {view === "leads" && (
              <>
                <button onClick={loadLeads} data-testid="admin-refresh-btn" className="p-2 rounded-full hover:bg-white/5 transition-colors" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={exportCsv} data-testid="admin-export-csv" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] tracking-[0.22em] uppercase transition-colors">
                  <Download className="w-3 h-3" /> CSV
                </button>
              </>
            )}
            <button onClick={logout} data-testid="admin-logout-btn" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-[0.22em] uppercase text-white/70 hover:text-white transition-colors">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        {/* View tabs */}
        <div className="flex items-center gap-1 mb-8 p-1 rounded-full bg-white/5 border border-white/10 w-fit" data-testid="admin-view-tabs">
          {[
            { k: "leads", label: "Leads" },
            { k: "campaigns", label: "Campaigns" },
            { k: "settings", label: "Site Settings" },
          ].map((v) => (
            <button
              key={v.k}
              data-testid={`admin-tab-${v.k}`}
              onClick={() => setView(v.k)}
              className={`px-5 py-2 rounded-full text-[10px] tracking-[0.22em] uppercase transition-all ${
                view === v.k ? "bg-white text-[#0F0E0D]" : "text-white/65 hover:text-white"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {view === "campaigns" && <AdminCampaigns />}
        {view === "settings" && <AdminSettings />}
        {view === "leads" && (<>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8" data-testid="admin-stats-grid">
          {statCards.map((s) => (
            <div key={s.label} data-testid={`admin-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`} className={`relative rounded-2xl p-4 bg-gradient-to-br ${s.color} border border-white/10 backdrop-blur-sm`}>
              <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-white/55">
                {s.icon} {s.label}
              </div>
              <div className="font-serif text-3xl font-light mt-2">{s.value ?? "—"}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6" data-testid="admin-filters">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              data-testid="admin-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, brand, email, message…"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm placeholder-white/35 focus:outline-none focus:border-white/30"
            />
          </div>
          <Select testid="admin-filter-type" value={filterType} onChange={setFilterType} options={TYPE_OPTIONS} icon={<Filter className="w-3 h-3" />} />
          <Select testid="admin-filter-status" value={filterStatus} onChange={setFilterStatus} options={STATUS_OPTIONS} />
          <Select testid="admin-filter-tag" value={filterTag} onChange={setFilterTag} options={[{ value: "", label: "All tags" }, ...allTags.map((t) => ({ value: t, label: t }))]} icon={<Tag className="w-3 h-3" />} />
        </div>

        {/* Leads table */}
        {err && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">{err}</div>}

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="admin-leads-table">
              <thead className="bg-white/[0.03] text-[10px] tracking-[0.2em] uppercase text-white/45">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Received</th>
                  <th className="text-left px-5 py-3 font-medium">Name / Brand</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Type</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Tags</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={7} className="py-10 text-center text-white/40">Loading…</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-white/40" data-testid="admin-empty-state">No leads match your filters.</td></tr>
                ) : leads.map((l) => (
                  <tr key={l.id} data-testid={`admin-lead-row-${l.id}`} className="hover:bg-white/[0.025] transition-colors cursor-pointer" onClick={() => setSelected(l)}>
                    <td className="px-5 py-4 text-white/60 whitespace-nowrap">{fmt(l.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{l.name}</div>
                      <div className="text-xs text-white/45">{l.brand || "—"}</div>
                    </td>
                    <td className="px-5 py-4 text-white/70">{l.email}</td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] tracking-[0.18em] uppercase text-white/65">
                        {l.type === "media_kit" ? "Media Kit" : "Collaboration"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border ${STATUS_COLOR[l.status] || STATUS_COLOR.new}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(l.tags || []).slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">{t}</span>
                        ))}
                        {(l.tags?.length || 0) > 3 && <span className="text-[10px] text-white/40">+{l.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); deleteLead(l.id); }} data-testid={`admin-delete-${l.id}`} className="p-1.5 rounded hover:bg-red-500/10 text-white/40 hover:text-red-300 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3 text-xs text-white/40">{leads.length} lead{leads.length === 1 ? "" : "s"}</div>
        </>)}
      </main>

      {selected && (
        <LeadDetailModal
          lead={selected}
          allTags={allTags}
          onClose={() => setSelected(null)}
          onUpdate={updateLead}
          onDelete={() => deleteLead(selected.id)}
        />
      )}
    </div>
  );
}

function Select({ testid, value, onChange, options, icon }) {
  return (
    <div className="relative">
      <select
        data-testid={testid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-7 pr-8 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0F0E0D]">{o.label}</option>
        ))}
      </select>
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">{icon}</span>}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
    </div>
  );
}

function LeadDetailModal({ lead, allTags, onClose, onUpdate, onDelete }) {
  const [status, setStatus] = useState(lead.status);
  const [tags, setTags] = useState(lead.tags || []);
  const [notes, setNotes] = useState(lead.admin_notes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStatus(lead.status);
    setTags(lead.tags || []);
    setNotes(lead.admin_notes || "");
    setSaved(false);
  }, [lead]);

  const toggleTag = (t) => {
    setTags((curr) => (curr.includes(t) ? curr.filter((x) => x !== t) : [...curr, t]));
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onUpdate(lead.id, { status, tags, admin_notes: notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="admin-lead-modal" className="fixed inset-0 z-30 bg-black/70 backdrop-blur-md grid place-items-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#161413] border border-white/10 rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} data-testid="admin-modal-close" className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 border-b border-white/10">
          <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 mb-2">
            {lead.type === "media_kit" ? "Media Kit Request" : "Collaboration Inquiry"}
          </div>
          <h2 className="font-serif text-3xl font-light">{lead.name}</h2>
          {lead.brand && <div className="text-white/55 mt-1">{lead.brand}</div>}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
            <a href={`mailto:${lead.email}`} data-testid="modal-email-link" className="inline-flex items-center gap-1.5 hover:text-[#F0A89C] transition-colors">
              <Mail className="w-3.5 h-3.5" /> {lead.email}
            </a>
            {lead.phone && (
              <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {lead.phone}</span>
            )}
            <span className="text-white/45">{fmt(lead.created_at)}</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {lead.message && (
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 mb-2">Message</div>
              <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm leading-relaxed whitespace-pre-wrap">{lead.message}</div>
            </div>
          )}

          <div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 mb-2">Status</div>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.filter((s) => s.value).map((s) => (
                <button
                  key={s.value}
                  data-testid={`modal-status-${s.value}`}
                  onClick={() => setStatus(s.value)}
                  className={`px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase border transition-all ${
                    status === s.value ? STATUS_COLOR[s.value] : "border-white/10 text-white/50 hover:border-white/30"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 mb-2">Lead tags</div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <button
                  key={t}
                  data-testid={`modal-tag-${t.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => toggleTag(t)}
                  className={`px-3 py-1.5 rounded-full text-[10px] tracking-[0.18em] uppercase border transition-all ${
                    tags.includes(t)
                      ? "bg-[#F0A89C]/15 text-[#F0A89C] border-[#F0A89C]/40"
                      : "border-white/10 text-white/55 hover:border-white/30"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 mb-2">Admin notes</div>
            <textarea
              data-testid="modal-admin-notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes only visible to admins…"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm leading-relaxed resize-none focus:outline-none focus:border-white/30 placeholder-white/30"
            />
          </div>
        </div>

        <div className="px-8 py-5 border-t border-white/10 flex items-center justify-between gap-3 bg-[#1A1817]">
          <button onClick={onDelete} data-testid="modal-delete-btn" className="text-xs tracking-[0.18em] uppercase text-white/45 hover:text-red-300 transition-colors inline-flex items-center gap-1.5">
            <Trash2 className="w-3 h-3" /> Delete lead
          </button>
          <div className="flex items-center gap-3">
            {saved && <span data-testid="modal-saved-indicator" className="text-xs text-emerald-300">Saved</span>}
            <button onClick={onClose} className="text-xs tracking-[0.18em] uppercase text-white/55 hover:text-white px-3 py-2">
              Close
            </button>
            <button
              onClick={save}
              data-testid="modal-save-btn"
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F0A89C] to-[#E1837A] text-[#1a1a1a] text-[10px] tracking-[0.22em] uppercase font-medium hover:brightness-110 transition-all disabled:opacity-50"
            >
              {saving ? "..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
