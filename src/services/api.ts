import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { BASE_URL } from '@/constants/config';
import { useAuthStore } from '@/store/authStore';
import {
  clearAuth,
  getAccessToken,
  isTokenExpired,
} from '@/utils/storage';

function extractErrorMessage(error: AxiosError): string {
  const data = error.response?.data as
    | { message?: string; error?: string }
    | undefined;

  return (
    data?.message ??
    data?.error ??
    error.message ??
    'Something went wrong'
  );
}

async function attachAuthHeader(
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
  const token = await getAccessToken();

  if (!token) {
    return config;
  }

  if (isTokenExpired(token)) {
    await clearAuth();
    return config;
  }

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
}

function attachInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use(
    async (config) => attachAuthHeader(config),
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        await clearAuth();
        const { isAuthenticated, logout } = useAuthStore.getState();
        if (isAuthenticated) {
          logout();
        }
      }

      if (error.message) {
        error.message = extractErrorMessage(error);
      }

      return Promise.reject(error);
    },
  );
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const multipartApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

attachInterceptors(api);
attachInterceptors(multipartApi);

export default api;
export { multipartApi };
