import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) {
    return (
      <div data-testid="admin-loading" className="min-h-screen grid place-items-center bg-[#0F0E0D] text-white">
        <div className="font-serif italic text-2xl opacity-60">Loading…</div>
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}
