import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute Component.
 *
 * Checks if the authentication token ('crm-token') is present in localStorage.
 * If the token is missing, the user is redirected to the /login page.
 * If the token is present, the component renders the child routes via <Outlet />.
 */
export function ProtectedRoute() {
  const token = localStorage.getItem('crm-token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
