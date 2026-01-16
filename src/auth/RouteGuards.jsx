import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';

const DASHBOARD_FALLBACK = '/admin/default'; // đổi nếu dashboard khác

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // hoặc spinner nếu muốn
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/sign-in?next=${next}`} replace />;
  }
  return children;
}

export function RequireGuest({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) {
    return <Navigate to={DASHBOARD_FALLBACK} replace />;
  }
  return children;
}

/** Optional: giới hạn theo vai trò */
export function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/sign-in?next=${next}`} replace />;
  }
  if (!user.roles?.includes(role)) {
    return <Navigate to={DASHBOARD_FALLBACK} replace />;
  }
  return children;
}
