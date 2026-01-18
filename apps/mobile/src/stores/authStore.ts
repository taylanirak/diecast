import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  membershipTier?: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,

  login: async (token: string, user: User) => {
    await SecureStore.setItemAsync('accessToken', token);
    set({ isAuthenticated: true, token, user });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ isAuthenticated: false, token: null, user: null });
  },

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        // Validate token by fetching user profile
        const response = await api.get('/users/me');
        set({
          isAuthenticated: true,
          token,
          user: response.data,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      // Token invalid or expired
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      set({ isAuthenticated: false, token: null, user: null, isLoading: false });
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } });
    }
  },
}));
