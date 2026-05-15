'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });

      if (data.success) {
        setAuth(data.user, data.accessToken, data.refreshToken);
        toast.success('Welcome back!');
        router.push('/workspaces');
      } else {
        toast.error(data.error?.message || 'Login failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Connection failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight font-display">Welcome Back</h1>
          <p className="text-text-secondary text-lg">Enter your credentials to access your flow</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-text-dim mb-2 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-text-dim mb-2 uppercase tracking-wider">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link href="/register" className="text-accent-blue hover:text-accent-cyan transition-colors font-semibold">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
