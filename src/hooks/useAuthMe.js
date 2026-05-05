// ============================================================
// useAuthMe — Session Rehydration Hook
// PRD §Module 1: On app initialisation (via a top-level
// useEffect), GET /api/auth/me validates the HttpOnly cookie
// and repopulates the Zustand auth store.
//
// This hook is called ONCE at app startup by AuthInitializer.
// It bridges TanStack Query (server state) → Zustand (UI state).
//
// Phase 2 migration: swap mockGetMe with:
//   fetch('/api/auth/me', { credentials: 'include' })
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { mockGetMe } from '../mocks/authHandlers';
import useAuthStore from '../stores/authStore';

export default function useAuthMe() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: mockGetMe, // Phase 2: replace with real fetch
    retry: false,       // Don't retry on 401 — it means no session
    staleTime: 60 * 1000,    // PRD: user data = 1 min stale
    gcTime: 5 * 60 * 1000,   // PRD: user data = 5 min gc
  });

  useEffect(() => {
    if (query.isSuccess) {
      setUser(query.data.user);
    }
    if (query.isError) {
      clearUser();
    }
  }, [query.isSuccess, query.isError, query.data, setUser, clearUser]);

  return query;
}
