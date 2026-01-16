// src/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';

export default function ProtectedRoute({ children, requiresAuth }) {
  console.log(requiresAuth);
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <span>Loading…</span>
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/auth/sign-in?next=${next}`} replace />;
  }

  return children;
}
