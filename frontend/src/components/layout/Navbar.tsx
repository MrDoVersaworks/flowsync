'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Layout, LogOut, Settings, Plus } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  if (isAuthPage && !isAuthenticated) {
    // We still show a simplified navbar on auth pages
    return (
      <header className="fixed top-0 left-0 right-0 z-50 glass-header h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center shadow-lg shadow-accent-blue/30 group-hover:scale-110 transition-smooth">
            <Layout className="w-5 h-5 text-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            FlowSync
          </span>
        </Link>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header h-16 flex items-center justify-between px-3 md:px-6">
      <div className="flex items-center gap-3 md:gap-8">
        <Link href={isAuthenticated ? "/workspaces" : "/"} className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center shadow-lg shadow-accent-blue/30 group-hover:scale-110 transition-smooth">
            <Layout className="w-5 h-5 text-foreground" />
          </div>
          <span className="text-base md:text-xl font-bold tracking-tight hidden min-[400px]:inline">FlowSync</span>
        </Link>

        {isAuthenticated && (
          <nav className="flex items-center gap-3 md:gap-6">
            <Link 
              href="/workspaces" 
              className={`text-[10px] md:text-sm font-bold uppercase tracking-wider transition-smooth ${pathname.includes('/workspaces') ? 'text-foreground' : 'text-text-secondary hover:text-foreground'}`}
            >
              Boards
            </Link>
            <Link 
              href="/settings" 
              className={`text-[10px] md:text-sm font-bold uppercase tracking-wider transition-smooth ${pathname === '/settings' ? 'text-foreground' : 'text-text-secondary hover:text-foreground'}`}
            >
              Settings
            </Link>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-full bg-bg-secondary border border-border-color">
              <div className="w-6 h-6 rounded-full bg-accent-purple flex items-center justify-center text-[10px] font-bold">
                {user?.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-text-secondary">{user?.name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-bg-secondary rounded-lg text-text-secondary hover:text-foreground transition-smooth"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-text-secondary hover:text-foreground transition-smooth whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="btn-primary px-4 py-2 text-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
