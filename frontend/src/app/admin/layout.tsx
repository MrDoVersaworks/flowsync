'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Admin Layout Guard for FlowSync
 * Redirects unauthenticated users to the login page.
 * The backend admin routes are already protected by authMiddleware (JWT Bearer).
 * This guard prevents the admin UI shell from being exposed to unauthenticated visitors.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        setChecked(true);
      }
    }
  }, [isAuthenticated, mounted, router]);

  if (!mounted || !checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#05050a]">
        <div className="w-8 h-8 border-4 border-[#6c5ce7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
