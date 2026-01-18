import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  phone?: string;
  displayName: string;
  isVerified: boolean;
  isSeller: boolean;
  sellerType?: string;
  createdAt: Date;
  isAdmin?: boolean;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: async (email: string, password: string) => {
        console.log('[AuthStore] login called with:', email);
        const response = await authApi.login(email, password);
        console.log('[AuthStore] API response:', response.data);
        const { user, tokens } = response.data;
        const token = tokens.accessToken;
        console.log('[AuthStore] Token extracted:', token ? 'yes' : 'no');
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          console.log('[AuthStore] Token saved to localStorage');
        }
        
        set({ user, token, isAuthenticated: true });
        console.log('[AuthStore] State updated, isAuthenticated: true');
      },
      
      register: async (displayName: string, email: string, password: string) => {
        await authApi.register({ displayName, email, password });
        await get().login(email, password);
      },
      
      logout: async () => {
        try {
          await authApi.logout();
        } catch (e) {
          // Ignore logout errors
        }
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          const token = typeof window !== 'undefined' 
            ? localStorage.getItem('auth_token') 
            : null;
            
          if (token) {
            const response = await authApi.getProfile();
            set({ user: response.data, token, isAuthenticated: true });
          } else {
            set({ user: null, token: null, isAuthenticated: false });
          }
        } catch (error) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useAuthStore;


