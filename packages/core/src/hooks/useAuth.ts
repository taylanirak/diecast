import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, logout, setLoading, setUser } = useAuthStore();

  const checkAuth = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    // Token validation would happen here via API call
    setLoading(false);
  }, [token, setLoading]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      // This would be implemented with the actual API
      throw new Error('Login should be implemented with API client');
    },
    []
  );

  const handleLogout = useCallback(() => {
    logout();
    // Clear any other stored data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tarodan-cart');
    }
  }, [logout]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
    setUser,
  };
}
