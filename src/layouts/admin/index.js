// Chakra imports
import ProtectedRoute from 'auth/ProtectedRoute';
import EventHorizonLayout from 'components/layout/EventHorizonLayout';
import FixedPlugin from 'components/fixedPlugin/FixedPlugin';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import routes from 'routes.js';

// Custom Chakra theme
export default function Dashboard(props) {
  const getRoutes = (rs) =>
    rs.flatMap((r, idx) => {
      if (r.collapse) return getRoutes(r.items);
      if (r.layout !== '/') return [];
      const key = r.path || idx;

      const element = r.requiresAuth ? (
        <ProtectedRoute>{r.component}</ProtectedRoute>
      ) : (
        r.component
      );

      return <Route key={key} path={r.path} element={element} />;
    });

  document.documentElement.dir = 'ltr';

  // All pages use Event Horizon layout (including landing)
  return (
    <>
      <EventHorizonLayout>
        <Routes>{getRoutes(routes)}</Routes>
      </EventHorizonLayout>
      <FixedPlugin />
    </>
  );
}
