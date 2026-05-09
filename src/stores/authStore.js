// Zustand Auth Store
//
// Single source of truth for CLIENT-SIDE auth UI state.
// State Boundary Rule: if data comes from the
// server, it belongs in TanStack Query. If it is local UI
// state, it belongs in Zustand.
//
// This store holds the authenticated user object and status
// flags. All async API calls live in TanStack hooks/mutations
// — Zustand only stores the result.

import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // 
  user: null,              // The authenticated user object (sans passwordHash)
  isAuthenticated: false,  // Derived from user presence
  isHydrating: true,       // True until initial GET /api/auth/me completes
                           // Prevents flash of login page on refresh

  // 

  /**
   * Called when login, register, or session rehydration succeeds.
   * Sets the user and marks authentication as complete.
   */
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isHydrating: false,
    }),

  /**
   * Called on logout, 401 response, or session expiry.
   * Clears the user and marks as unauthenticated.
   */
  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isHydrating: false,
    }),

  /**
   * Explicitly control the hydration loading state.
   * Used by AuthInitializer during the initial /me check.
   */
  setHydrating: (val) =>
    set({ isHydrating: val }),
}));

export default useAuthStore;
