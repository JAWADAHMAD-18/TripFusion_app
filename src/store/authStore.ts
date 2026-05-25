import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  isGuest: boolean;
  setAuth: (user: User, accessToken: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  loadFromStorage: () => Promise<void>;
  setGuestMode: (value: boolean) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  isGuest: false,

  setAuth: async (user, accessToken) => {
    await saveAccessToken(accessToken);
    await saveUser(user);
    // Also clear guest mode just in case
    await AsyncStorage.removeItem('tripfusion_guest_mode');
    set({
      user,
      token: accessToken,
      isAuthenticated: true,
      isAdmin: user.isAdmin,
      isGuest: false,
    });
  },

  logout: () => {
    const wasGuest = get().isGuest;
    if (wasGuest) {
      void AsyncStorage.removeItem('tripfusion_guest_mode');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isGuest: false,
    });
    void clearAuth();
    void import('@/services/authService').then((module) => module.logout());
  },

  setLoading: (isLoading) => set({ isLoading }),

  setGuestMode: async (value: boolean) => {
    if (value) {
      await AsyncStorage.setItem('tripfusion_guest_mode', 'true');
      set({ isGuest: true, isAuthenticated: false, user: null, token: null, isAdmin: false });
    } else {
      await AsyncStorage.removeItem('tripfusion_guest_mode');
      set({ isGuest: false });
    }
  },

  loadFromStorage: async () => {
    set({ isLoading: true });
    try {
      const [token, storedUser] = await Promise.all([
        getAccessToken(),
        getUser(),
      ]);

      if (!token) {
        const guestVal = await AsyncStorage.getItem('tripfusion_guest_mode');
        set({ isAuthenticated: false, isGuest: guestVal === 'true' });
        return;
      }

      if (isTokenExpired(token)) {
        await clearAuth();
        const guestVal = await AsyncStorage.getItem('tripfusion_guest_mode');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          isGuest: guestVal === 'true',
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
          isGuest: false,
        });
        return;
      }

      set({
        token,
        isAuthenticated: true,
        isAdmin: false,
        isGuest: false,
      });
    } catch {
      set({ isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
