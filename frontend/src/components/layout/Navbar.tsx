'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, User, Layout, ChevronDown, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-border-color bg-bg-primary/80 backdrop-blur-md z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-smooth">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-accent-gold rounded-sm transform rotate-45 opacity-20"></div>
            <Layout className="w-8 h-8 text-accent-gold relative z-10" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            Flow<span className="text-accent-gold">Sync</span>
          </span>
        </Link>

        {/* Workspace Selector Placeholder */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-bg-surface transition-smooth cursor-pointer border border-transparent hover:border-border-color">
          <span className="text-sm font-medium text-text-secondary">Main Workspace</span>
          <ChevronDown className="w-4 h-4 text-text-dim" />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link 
          href="/settings"
          className="p-2 text-text-dim hover:text-accent-gold transition-smooth rounded-md hover:bg-bg-surface"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-bg-surface border border-border-color">
          <div className="w-6 h-6 rounded-full bg-accent-gold/20 flex items-center justify-center">
            <User className="w-4 h-4 text-accent-gold" />
          </div>
          <span className="text-sm font-medium text-text-primary hidden xs:block">{user.name}</span>
        </div>

        <button
          onClick={clearAuth}
          className="p-2 text-text-dim hover:text-red-400 transition-smooth rounded-md hover:bg-red-400/10"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
