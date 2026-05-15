import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authApi } from '../utils/api';
import useAuthStore from '../stores/authStore';

export default function useAuthMe() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
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
