import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { useAdminAuth, formatApiError } from "./AuthContext.jsx";

export default function AdminLogin() {
  const { admin, login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen grid place-items-center bg-[#0F0E0D] text-white relative overflow-hidden">
      <div
        className="absolute"
        style={{
          width: 600, height: 600, top: "-20%", left: "-15%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(240,168,156,0.25), transparent 65%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 520, height: 520, bottom: "-15%", right: "-10%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,110,0.18), transparent 65%)",
          filter: "blur(70px)",
        }}
      />

      <div className="relative w-full max-w-md mx-4 backdrop-blur-2xl bg-white/[0.04] border border-white/10 rounded-3xl p-10">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.28em] uppercase text-white/45 mb-4">
          <Lock className="w-3 h-3" /> Admin Access
        </div>
        <h1 className="font-serif text-4xl font-light leading-tight">
          Yaren <span className="italic text-[#F0A89C]">Alaca</span> <br/>
          <span className="text-white/55 font-extralight italic text-2xl">Lead Console</span>
        </h1>
        <p className="mt-3 text-sm text-white/55 font-light">
          Sign in to manage incoming collaboration leads.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5" data-testid="admin-login-form">
          <div>
            <label className="block text-[10px] tracking-[0.22em] uppercase text-white/50 mb-2">Email</label>
            <input
              type="email"
              data-testid="admin-login-email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-white/15 focus:border-[#F0A89C] outline-none py-2.5 text-sm placeholder-white/25"
              placeholder="admin@yarenalacapr.com"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.22em] uppercase text-white/50 mb-2">Password</label>
            <input
              type="password"
              data-testid="admin-login-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-white/15 focus:border-[#F0A89C] outline-none py-2.5 text-sm placeholder-white/25"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div data-testid="admin-login-error" className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            data-testid="admin-login-submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-full text-[11px] tracking-[0.22em] uppercase bg-gradient-to-r from-[#F0A89C] to-[#E1837A] text-[#1a1a1a] font-medium flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "..." : "Sign In"} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <a href="/" className="mt-8 block text-center text-[10px] tracking-[0.22em] uppercase text-white/40 hover:text-white/80 transition-colors">
          ← Back to site
        </a>
      </div>
    </div>
  );
}
