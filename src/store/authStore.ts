import { create } from 'zustand';

import type { User } from '@/services/authService';
import {
  clearAuth,
  getAccessToken,
  getUser,
  isTokenExpired,
  saveAccessToken,
  saveUser,
} from '@/utils/storage';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  loadFromStorage: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,

  setAuth: async (user, accessToken) => {
    await saveAccessToken(accessToken);
    await saveUser(user);
    set({
      user,
      token: accessToken,
      isAuthenticated: true,
      isAdmin: user.isAdmin,
    });
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    });
    void clearAuth();
    void import('@/services/authService').then((module) => module.logout());
  },

  setLoading: (isLoading) => set({ isLoading }),

  loadFromStorage: async () => {
    set({ isLoading: true });
    try {
      const [token, storedUser] = await Promise.all([
        getAccessToken(),
        getUser(),
      ]);

      if (!token) {
        set({ isAuthenticated: false });
        return;
      }

      if (isTokenExpired(token)) {
        await clearAuth();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        });
        return;
      }

      if (storedUser) {
        const user = storedUser as User;
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: user.isAdmin ?? false,
        });
        return;
      }

      set({
        token,
        isAuthenticated: true,
        isAdmin: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
