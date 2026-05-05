// ============================================================
// AuthInitializer — PRD §Module 1 Session Rehydration
//
// Top-level component that triggers the useAuthMe hook on
// app mount. This is the "top-level useEffect" required by
// the PRD to check GET /api/auth/me and repopulate the
// Zustand auth store on page refresh.
//
// Must wrap the entire app (inside QueryClientProvider,
// outside BrowserRouter) so the session check fires before
// any route renders.
// ============================================================

import useAuthMe from '../../hooks/useAuthMe';

export default function AuthInitializer({ children }) {
  useAuthMe(); // fires GET /api/auth/me on mount
  return children;
}
