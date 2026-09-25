'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a17.5 17.5 0 0 1-3.3 3.9M6.2 6.3C3.7 8 2.5 12 2.5 12s3.5 6 9.5 6c1.4 0 2.6-.3 3.7-.8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 9.9a3 3 0 1 0 4.2 4.2" />
    </svg>
  );
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAgreed) {
      toast.error('You must agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', { name, email, password });

      if (data.success) {
        setAuth(data.user, data.accessToken);
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input pr-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-text-dim transition-colors hover:text-foreground focus:outline-none focus-visible:text-accent-blue"
              >
                <EyeIcon hidden={!showPassword} />
              </button>
            </div>
          </div>

          {/* Terms & Conditions Agreement Section */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <input
                id="terms-checkbox"
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/20 text-accent-blue focus:ring-accent-blue bg-black/40 cursor-pointer"
              />
              <label htmlFor="terms-checkbox" className="text-xs text-text-dim leading-relaxed cursor-pointer select-none">
                I have read and agree to the{' '}
                <Link href="/terms" target="_blank" className="text-accent-blue underline hover:text-accent-cyan font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" className="text-accent-blue underline hover:text-accent-cyan font-medium">
                  Privacy Policy
                </Link>.
              </label>
            </div>
            
            <div className="flex gap-2 pt-1 border-t border-white/5 text-[11px]">
              <button
                type="button"
                onClick={() => setTermsAgreed(true)}
                className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                  termsAgreed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-text-dim hover:bg-white/10'
                }`}
              >
                {termsAgreed ? '✓ Terms Agreed' : 'I Agree'}
              </button>
              <button
                type="button"
                onClick={() => setTermsAgreed(false)}
                className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                  !termsAgreed
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-white/5 text-text-dim hover:bg-white/10'
                }`}
              >
                Decline
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !termsAgreed}
            className={`btn-primary ${!termsAgreed ? 'opacity-50 cursor-not-allowed' : ''}`}
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
