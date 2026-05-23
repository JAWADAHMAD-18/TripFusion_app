import type { AxiosResponse } from 'axios';

import api from '@/services/api';
import { clearAuth } from '@/utils/storage';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  profilePic?: string;
  authProvider: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

function extractData<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  const payload = response.data;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<ApiEnvelope<AuthResponse>>('/user/login', payload);
  return extractData(response);
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post<ApiEnvelope<AuthResponse>>(
    '/user/register',
    payload,
  );
  return extractData(response);
}

export async function googleSignIn(idToken: string): Promise<AuthResponse> {
  const response = await api.post<ApiEnvelope<AuthResponse>>('/user/auth/google', {
    idToken,
  });
  return extractData(response);
}

export async function logout(): Promise<void> {
  try {
    await api.post('/user/logout');
  } catch {
    // ignore logout API errors
  } finally {
    await clearAuth();
  }
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<ApiEnvelope<{ user: User }>>('/user/me');
  const data = extractData(response);
  return data.user;
}

export async function forgotPassword(email: string): Promise<string> {
  const response = await api.post<ApiEnvelope<unknown>>(
    '/user/auth/forgot-password',
    { email },
  );
  return response.data.message ?? 'Password reset email sent.';
}
