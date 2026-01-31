// Chakra imports
import { Box } from '@chakra-ui/react';
import ProtectedRoute from 'auth/ProtectedRoute';
import EventHorizonLayout from 'components/layout/EventHorizonLayout';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import routes from 'routes.js';

// Custom Chakra theme
export default function Dashboard(props) {
  const { pathname } = useLocation();

  // Check if current route is landing page
  const isLandingPage = pathname === '/';

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

  // Render landing page without layout wrapper
  if (isLandingPage) {
    return (
      <Box>
        <Routes>{getRoutes(routes)}</Routes>
      </Box>
    );
  }

  // Render all other pages with Event Horizon layout
  return (
    <EventHorizonLayout>
      <Routes>{getRoutes(routes)}</Routes>
    </EventHorizonLayout>
  );
}
