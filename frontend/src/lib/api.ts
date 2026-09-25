import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
if (process.env.NODE_ENV === 'production' && !configuredApiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL must be configured for production builds');
}
const API_URL = (configuredApiUrl || 'http://localhost:5000').replace(/\/$/, '') + '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        useAuthStore.getState().setAuth(data.user, data.accessToken);
        return data.accessToken as string;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isRefreshRequest = request?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && request && !request._retry && !isRefreshRequest) {
      request._retry = true;
      try {
        const token = await refreshAccessToken();
        request.headers.Authorization = `Bearer ${token}`;
        return api(request);
      } catch {
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  }
);
