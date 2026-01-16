// src/auth/GuestRoute.jsx
import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const [sp] = useSearchParams();
  const next = sp.get('next') || '/';

  if (loading) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <span>Loading…</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to={next} replace />;
  }

  return children;
}
