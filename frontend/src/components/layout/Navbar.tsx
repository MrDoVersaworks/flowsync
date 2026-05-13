'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Layout, LogOut, Settings, Plus } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  if (isAuthPage && !isAuthenticated) {
    // We still show a simplified navbar on auth pages
    return (
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center shadow-lg shadow-accent-blue/30 group-hover:scale-110 transition-smooth">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            FlowSync
          </span>
        </Link>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center shadow-lg shadow-accent-blue/30 group-hover:scale-110 transition-smooth">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">FlowSync</span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/workspaces" 
              className={`text-sm font-medium transition-smooth ${pathname.includes('/workspaces') ? 'text-white' : 'text-text-secondary hover:text-white'}`}
            >
              Workspaces
            </Link>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-accent-purple flex items-center justify-center text-[10px] font-bold">
                {user?.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-text-secondary">{user?.name}</span>
            </div>
            <button 
              onClick={clearAuth}
              className="p-2 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-smooth"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-text-secondary hover:text-white transition-smooth"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="bg-white text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-white/90 transition-smooth"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
