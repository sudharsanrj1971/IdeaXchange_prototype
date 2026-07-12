// src/components/RequireAdmin.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrapper that only renders children if the logged‑in user has role 'admin'
// Otherwise redirects to home (or a not‑authorized page).
export default function RequireAdmin() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0f0f1a',
        color: '#a78bfa',
        fontSize: '1.1rem',
      }}>
        Loading…
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    // Non‑admin users are sent back to the main dashboard
    return <Navigate to="/" replace />;
  }

  // Admin user – render nested routes
  return <Outlet />;
}
