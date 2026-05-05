// ============================================================
// ProtectedRoute — PRD §Module 1
// React Router wrapper that guards authenticated routes.
// Reads from Zustand auth store and redirects to /login if:
//   1. User is not authenticated (401 scenario)
//   2. User's isActive is false (deactivated account)
//
// Uses React Router's <Outlet> pattern — all routes nested
// inside <ProtectedRoute> are automatically guarded. Other
// team members simply add their <Route> inside the block.
// ============================================================

import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const user = useAuthStore((state) => state.user);

  // Still checking session — show loading spinner
  // Prevents flash of login page on page refresh
  if (isHydrating) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted small">Checking session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login (handles 401 scenario)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but account deactivated → redirect to login
  if (user && !user.isActive) {
    return <Navigate to="/login" replace />;
  }

  // All checks passed — render the child route
  return <Outlet />;
}
