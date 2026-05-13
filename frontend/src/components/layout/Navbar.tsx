'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, User, Layout, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { user, clearAuth, isAuthenticated } = useAuthStore();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-[#0a0a0b]/80 backdrop-blur-md z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-blue-600 rounded-lg transform rotate-45 opacity-20"></div>
            <Layout className="w-8 h-8 text-blue-500 relative z-10" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            Flow<span className="text-blue-500">Sync</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {isAuthenticated ? (
          <>
            <Link 
              href="/settings"
              className="p-2 text-white/40 hover:text-blue-400 transition-all rounded-xl hover:bg-white/5"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-white hidden xs:block">{user?.name}</span>
            </div>

            <button
              onClick={clearAuth}
              className="p-2 text-white/40 hover:text-red-400 transition-all rounded-xl hover:bg-red-400/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="text-sm font-medium text-white/60 hover:text-white transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
