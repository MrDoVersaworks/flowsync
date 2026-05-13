'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Plus, Users, Hash, Loader2, ArrowRight, Sparkles, Layout, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { workspaces, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const fetchWorkspaces = async () => {
        try {
          const { data } = await api.get('/workspaces');
          setWorkspaces(data.data);
        } catch (error) {
          toast.error('Failed to sync workspaces');
        } finally {
          setIsLoading(false);
        }
      };
      fetchWorkspaces();
    }
  }, [isAuthenticated, setWorkspaces]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    
    setIsLoading(true);
    try {
      const { data } = await api.post('/workspaces', { name: newWsName });
      setWorkspaces([...workspaces, data.data]);
      setIsCreating(false);
      setNewWsName('');
      toast.success('Workspace created!');
    } catch (error) {
      toast.error('Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-blue-400"
            >
              <Sparkles className="w-4 h-4" />
              <span>Sovereign AI Integration Now Live</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
            >
              Master Your Workflow
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/60 max-w-2xl mx-auto"
            >
              The production-grade collaborative Kanban for high-performance teams. 
              Sovereign AI task orchestration meets real-time distributed synchronization.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-2xl transition-all flex items-center justify-center space-x-2 group shadow-lg shadow-blue-600/20"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-10 rounded-2xl transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32"
          >
            <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">Real-Time Sync</h3>
              <p className="text-white/40">Collaborate instantly with team members via our optimized WebSocket nerve system.</p>
            </div>
            <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Sovereign AI</h3>
              <p className="text-white/40">Break down goals into actionable tasks using your own encrypted Gemini credentials.</p>
            </div>
            <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                <Layout className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold">Adaptive Layout</h3>
              <p className="text-white/40">A fluid, focused experience that restructures perfectly across all device viewports.</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}</h2>
          <p className="text-white/60">Select a workspace to start syncing your tasks.</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          New Workspace
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 mb-12 border-white/10"
          >
            <form onSubmit={handleCreateWorkspace} className="flex flex-col md:flex-row gap-4">
              <input 
                autoFocus
                type="text"
                placeholder="Workspace Name (e.g. Project X)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={newWsName}
                onChange={e => setNewWsName(e.target.value)}
              />
              <div className="flex gap-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-500 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-white/5 text-white/60 px-8 py-3 rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <motion.div 
            key={ws.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setActiveWorkspace(ws);
              router.push(`/workspaces/${ws.id}`);
            }}
            className="glass-card p-8 rounded-3xl border border-white/10 cursor-pointer group hover:border-blue-500/50 transition-all"
          >
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-all">
              <Hash className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-all">{ws.name}</h3>
            
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Users className="w-4 h-4" />
                <span>Invite Code: <span className="text-white font-mono">{ws.invite_code}</span></span>
              </div>
              <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}

        {workspaces.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center glass-card rounded-3xl border border-white/10">
            <p className="text-white/40 mb-6">You don't have any workspaces yet.</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center justify-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create your first one now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
