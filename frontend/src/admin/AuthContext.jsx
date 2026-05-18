import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "yapr_admin_token";

const AuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await axios.get(`${API}/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setAdmin(data);
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setAdmin(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${API}/admin/login`, { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: API });
    instance.interceptors.request.use((config) => {
      const t = localStorage.getItem(TOKEN_KEY);
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    instance.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setAdmin(null);
        }
        return Promise.reject(err);
      }
    );
    return instance;
  }, []);

  const value = useMemo(() => ({ token, admin, loading, login, logout, api }), [token, admin, loading, login, logout, api]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be inside <AdminAuthProvider>");
  return ctx;
}

export function formatApiError(err) {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || "Something went wrong";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => (e?.msg ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  }
  return String(detail);
}
