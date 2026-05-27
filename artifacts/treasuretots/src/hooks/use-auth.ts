import { useState, useEffect, useCallback } from 'react';
import { useGetMe, User } from '@workspace/api-client-react';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tt_token');
    }
    return null;
  });

  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      queryKey: ["getMe"],
      enabled: !!token,
      retry: false,
    }
  });

  const login = useCallback((newToken: string) => {
    localStorage.setItem('tt_token', newToken);
    setToken(newToken);
    refetch();
  }, [refetch]);

  const logout = useCallback(() => {
    localStorage.removeItem('tt_token');
    setToken(null);
  }, []);

  return {
    user: token ? user : null,
    isLoading: token ? isLoading : false,
    isAuthenticated: !!token && !!user,
    token,
    login,
    logout
  };
}