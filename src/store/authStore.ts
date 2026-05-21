import { create } from 'zustand';

import { TOKEN_KEY, USER_KEY } from '@/constants/config';
import {
  clearAll,
  getToken,
  getUser,
  saveToken,
  saveUser,
} from '@/utils/storage';

type AuthState = {
  user: object | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: object, token: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  loadFromStorage: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: async (user, token) => {
    await saveToken(token);
    await saveUser(user);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await clearAll();
    set({ user: null, token: null, isAuthenticated: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  loadFromStorage: async () => {
    set({ isLoading: true });
    try {
      const [token, user] = await Promise.all([
        getToken(),
        getUser(),
      ]);
      if (token && user) {
        set({ token, user, isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
