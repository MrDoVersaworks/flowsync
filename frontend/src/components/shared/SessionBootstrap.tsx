'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const API_URL = ((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api');

export default function SessionBootstrap() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => setAuth(data.user, data.accessToken))
      .catch(() => clearAuth());
  }, [setAuth, clearAuth]);

  return null;
}
