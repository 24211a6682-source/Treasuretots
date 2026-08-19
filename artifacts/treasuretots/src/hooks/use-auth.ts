import { useState, useEffect, useCallback } from 'react';
import { useGetMe, User } from '@workspace/api-client-react';

const AUTH_CHANGED_EVENT = "tt-auth-changed";

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

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("tt_token"));
    };

    window.addEventListener(AUTH_CHANGED_EVENT, syncToken);
    window.addEventListener("storage", syncToken);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncToken);
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem('tt_token', newToken);
    setToken(newToken);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    refetch();
  }, [refetch]);

  const logout = useCallback(() => {
    localStorage.removeItem('tt_token');
    setToken(null);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
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