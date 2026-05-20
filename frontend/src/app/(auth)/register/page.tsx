'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', { name, email, password });

      if (data.success) {
        setAuth(data.user, data.accessToken, data.refreshToken);
        toast.success('Account created successfully!');
        router.push('/workspaces');
      } else {
        toast.error(data.error?.message || 'Registration failed');
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
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight font-display">Create Account</h1>
          <p className="text-text-secondary text-lg">Join FlowSync and orchestrate your flow</p>
        </div>

        <div className="flex items-center gap-4 p-4 mb-8 bg-accent-blue/5 border border-accent-blue/10 rounded-2xl">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-accent-blue/10 rounded-xl text-accent-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-accent-blue uppercase tracking-widest mb-1">Frictionless Client Demo</p>
            <p className="text-xs text-text-dim leading-relaxed">
              Email verification is temporarily disabled to allow immediate access. 
              Any dummy email will work.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="full-name" className="block text-sm font-medium text-text-dim mb-2 uppercase tracking-wider">
              Full Name
            </label>
            <input
              id="full-name"
              type="text"
              className="auth-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-text-dim mb-2 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email-address"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-dim mb-2 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-10 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-blue hover:text-accent-cyan transition-colors font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
