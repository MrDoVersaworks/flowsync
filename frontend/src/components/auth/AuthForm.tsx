'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, formData);
      
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Authentication failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isLogin ? 'MrDoVersa' : 'Join the Force'}
        </h1>
        <p className="text-text-secondary">
          {isLogin ? 'Login to sync your reality' : 'Create your sovereign workspace'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative"
            >
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-bg-primary border border-border-color rounded-md py-3 pl-11 pr-4 focus:outline-none focus:border-accent-gold transition-smooth"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required={!isLogin}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-bg-primary border border-border-color rounded-md py-3 pl-11 pr-4 focus:outline-none focus:border-accent-gold transition-smooth"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-bg-primary border border-border-color rounded-md py-3 pl-11 pr-4 focus:outline-none focus:border-accent-gold transition-smooth"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent-gold hover:bg-accent-gold-hover text-bg-primary font-bold py-3 rounded-md transition-smooth flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isLogin ? 'Login' : 'Create Account'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-text-secondary hover:text-accent-gold transition-smooth text-sm"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}
