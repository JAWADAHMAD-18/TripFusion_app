import { useCallback, useState } from 'react';

import * as authService from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

type AuthActionResult = { success: true } | { success: false; error: string };

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong';
}

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isHydrating = useAuthStore((state) => state.isLoading);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutStore = useAuthStore((state) => state.logout);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      setIsSubmitting(true);
      try {
        const { user: authUser, accessToken } = await authService.login({
          email,
          password,
        });
        await setAuth(authUser, accessToken);
        return { success: true };
      } catch (error) {
        return { success: false, error: getErrorMessage(error) };
      } finally {
        setIsSubmitting(false);
      }
    },
    [setAuth],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ): Promise<AuthActionResult> => {
      setIsSubmitting(true);
      try {
        const { user: authUser, accessToken } = await authService.register({
          name,
          email,
          password,
        });
        await setAuth(authUser, accessToken);
        return { success: true };
      } catch (error) {
        return { success: false, error: getErrorMessage(error) };
      } finally {
        setIsSubmitting(false);
      }
    },
    [setAuth],
  );

  const googleSignIn = useCallback(
    async (idToken: string): Promise<AuthActionResult> => {
      setIsSubmitting(true);
      try {
        const { user: authUser, accessToken } =
          await authService.googleSignIn(idToken);
        await setAuth(authUser, accessToken);
        return { success: true };
      } catch (error) {
        return { success: false, error: getErrorMessage(error) };
      } finally {
        setIsSubmitting(false);
      }
    },
    [setAuth],
  );

  const logout = useCallback(() => {
    logoutStore();
  }, [logoutStore]);

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isLoading: isSubmitting || isHydrating,
    login,
    register,
    logout,
    googleSignIn,
  };
}
