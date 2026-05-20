'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Layout, LogOut, Settings, Plus, ChevronDown, Sparkles, Users, Zap, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-header h-16 flex items-center justify-between px-3 md:px-6">
        <div className="flex items-center gap-3 md:gap-8">
          <Link href={isAuthenticated ? "/workspaces" : "/"} className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center shadow-lg shadow-accent-blue/30 group-hover:scale-110 transition-smooth">
              <Layout className="w-5 h-5 text-foreground" />
            </div>
            <span className="text-base md:text-xl font-bold tracking-tight hidden min-[400px]:inline">FlowSync</span>
          </Link>

          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-3 md:gap-6">
              <Link
                href="/workspaces"
                className={`text-[10px] md:text-sm font-bold uppercase tracking-wider transition-smooth ${pathname.includes('/workspaces') ? 'text-foreground' : 'text-text-secondary hover:text-foreground'}`}
              >
                Boards
              </Link>

              {/* Sovereign Guide Dropdown */}
              <div className="relative group px-1">
                <button className={`text-[10px] md:text-sm font-bold uppercase tracking-wider transition-smooth flex items-center gap-1.5 ${pathname.includes('/guide') ? 'text-foreground' : 'text-text-secondary hover:text-foreground'}`}>
                  Guide
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform group-hover:rotate-180`} />
                </button>

                <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-smooth z-50">
                  <div className="w-56 glass-card p-4 border border-border-color shadow-2xl space-y-1">
                    {[
                      { id: 'orchestrate', label: 'Orchestrate', icon: Sparkles, color: 'text-accent-blue' },
                      { id: 'collaborate', label: 'Collaborate', icon: Users, color: 'text-accent-purple' },
                      { id: 'synchronize', label: 'Synchronize', icon: Layout, color: 'text-accent-cyan' },
                      { id: 'reconciliation', label: 'Reconciliation', icon: Zap, color: 'text-accent-cyan' },
                      { id: 'sovereignty', label: 'Permissions', icon: ShieldCheck, color: 'text-accent-red' },
                    ].map((item) => (
                      <Link
                        key={item.id}
                        href={`/guide/${item.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-secondary transition-smooth group/item"
                      >
                        <item.icon className={`w-4 h-4 ${item.color} group-hover/item:scale-110 transition-smooth`} />
                        <span className="text-xs font-bold text-text-secondary group-hover/item:text-foreground">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href="/settings"
                className={`text-[10px] md:text-sm font-bold uppercase tracking-wider transition-smooth ${pathname === '/settings' ? 'text-foreground' : 'text-text-secondary hover:text-foreground'}`}
              >
                Settings
              </Link>
              <a
                href="mailto:mrdoofficial1@gmail.com?subject=FlowSync%20Architectural%20Support"
                className="hidden sm:inline-flex text-[10px] md:text-sm font-bold uppercase tracking-wider text-text-secondary hover:text-accent-blue transition-smooth border border-accent-blue/20 px-3 py-1 rounded-full hover:bg-accent-blue/5"
                title="Direct Access to Architect Oyewole Favour"
              >
                Support
              </a>
            </nav>
          ) : null}
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

              <div className="hidden md:flex items-center">
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-bg-secondary rounded-lg text-text-secondary hover:text-foreground transition-smooth"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 hover:bg-bg-secondary rounded-lg text-text-secondary transition-smooth"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="w-5 h-5 flex flex-col justify-center gap-1">
                  <span className={`h-0.5 w-full bg-current rounded-full transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <span className={`h-0.5 w-full bg-current rounded-full transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`h-0.5 w-full bg-current rounded-full transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </div>
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

      {/* Mobile Menu Sanctuary */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-20 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-6 py-10">
              <Link
                href="/workspaces"
                className="text-2xl font-bold text-foreground font-display flex items-center justify-between group"
              >
                <span>Boards</span>
                <Layout className="w-6 h-6 text-accent-blue" />
              </Link>
              <Link
                href="/settings"
                className="text-2xl font-bold text-foreground font-display flex items-center justify-between group"
              >
                <span>Settings</span>
                <Settings className="w-6 h-6 text-text-dim" />
              </Link>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em] pl-1">Sovereign Guide</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'orchestrate', label: 'Orchestrate', icon: Sparkles, color: 'text-accent-blue' },
                    { id: 'collaborate', label: 'Collaborate', icon: Users, color: 'text-accent-purple' },
                    { id: 'synchronize', label: 'Synchronize', icon: Layout, color: 'text-accent-cyan' },
                    { id: 'reconciliation', label: 'Reconciliation', icon: Zap, color: 'text-accent-cyan' },
                    { id: 'sovereignty', label: 'Permissions', icon: ShieldCheck, color: 'text-accent-red' },
                  ].map((item) => (
                    <Link
                      key={item.id}
                      href={`/guide/${item.id}`}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-bg-secondary border border-border-color"
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-[10px] font-bold text-text-secondary">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <a
                href="mailto:mrdoofficial1@gmail.com?subject=FlowSync%20Architectural%20Support"
                className="text-2xl font-bold text-accent-blue font-display flex items-center justify-between group"
              >
                <span>Support</span>
                <div className="w-6 h-6 rounded-full bg-accent-blue/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent-blue" />
                </div>
              </a>

              <div className="mt-10 pt-10 border-t border-border-color">
                <button
                  onClick={handleLogout}
                  className="w-full py-4 bg-bg-secondary text-red-500 font-bold rounded-2xl flex items-center justify-center gap-3"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
