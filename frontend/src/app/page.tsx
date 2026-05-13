'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Plus, Users, Hash, Loader2, ArrowRight, Sparkles, Layout, Zap, Boxes, Compass } from 'lucide-react';
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
      <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
        {/* Sanctuary Backdrop */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-blue/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Floating Office Elements */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[15%] w-64 h-64 glass rounded-3xl border border-white/5"
          />
          <motion.div 
            animate={{ 
              y: [0, 30, 0],
              rotate: [0, -5, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[20%] left-[10%] w-96 h-96 glass rounded-full border border-white/5"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
          <div className="text-center space-y-10 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full text-sm font-semibold text-accent-blue backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4" />
              <span className="uppercase tracking-widest text-[10px]">Sovereign AI Infrastructure</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-9xl font-bold tracking-tighter font-display leading-[0.9]"
            >
              Orchestrate <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple">
                Your Sanctuary
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto font-light leading-relaxed"
            >
              The production-grade collaborative Kanban for elite teams. 
              Sovereign AI task orchestration meets real-time distributed synchronization.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
            >
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-accent-blue hover:bg-accent-blue/90 text-white font-bold py-5 px-12 rounded-2xl transition-smooth flex items-center justify-center space-x-3 group shadow-2xl shadow-accent-blue/40 text-lg"
              >
                <span>Enter FlowSync</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto glass hover:bg-white/5 text-white font-bold py-5 px-12 rounded-2xl transition-smooth text-lg"
              >
                Sign In
              </Link>
            </motion.div>
          </div>

          {/* Feature Sanctuary */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-40"
          >
            {[
              { icon: Zap, color: 'text-accent-blue', title: 'Nerve System', desc: 'Optimized WebSocket synchronization for instantaneous team alignment.' },
              { icon: Sparkles, color: 'text-accent-purple', title: 'Encrypted AI', desc: 'Break down goals with your own Gemini keys, stored with AES-256-GCM.' },
              { icon: Boxes, color: 'text-accent-cyan', title: 'Pure Geometry', desc: 'An adaptive interface that restructures perfectly for total focus.' }
            ].map((feature, idx) => (
              <div key={idx} className="glass-card p-10 space-y-6 group hover:-translate-y-2 transition-smooth">
                <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-smooth`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold font-display">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto min-h-screen relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 relative z-10">
        <div>
          <h1 className="text-5xl font-bold text-white mb-4 font-display tracking-tight">
            Sanctuary <span className="text-accent-blue">#{user?.name}</span>
          </h1>
          <p className="text-text-secondary text-lg">Select a workspace to synchronize your consciousness.</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-accent-blue hover:bg-accent-blue/90 text-white font-bold px-8 py-4 rounded-2xl transition-smooth flex items-center gap-3 shadow-xl shadow-accent-blue/20"
        >
          <Plus className="w-6 h-6" />
          <span>New Workspace</span>
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-10 mb-16"
          >
            <form onSubmit={handleCreateWorkspace} className="flex flex-col md:flex-row gap-6">
              <input 
                autoFocus
                type="text"
                placeholder="Orchestration Name (e.g. Project X)"
                className="flex-1 auth-input text-lg"
                value={newWsName}
                onChange={e => setNewWsName(e.target.value)}
              />
              <div className="flex gap-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-accent-blue text-white font-bold px-12 py-4 rounded-2xl hover:bg-accent-blue/90 transition-smooth"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Execute'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="glass text-text-dim px-12 py-4 rounded-2xl hover:text-white transition-smooth"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
        {workspaces.map((ws) => (
          <motion.div 
            key={ws.id}
            whileHover={{ y: -8 }}
            onClick={() => {
              setActiveWorkspace(ws);
              router.push(`/workspaces/${ws.id}`);
            }}
            className="glass-card p-10 cursor-pointer group hover:border-accent-blue/50 transition-smooth"
          >
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-accent-blue/20 transition-smooth">
              <Hash className="w-8 h-8 text-accent-blue" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent-blue transition-smooth font-display tracking-tight">
              {ws.name}
            </h3>
            
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-xs font-bold text-text-dim tracking-widest uppercase">
                  {ws.invite_code}
                </span>
              </div>
              <ArrowRight className="w-6 h-6 text-text-dim group-hover:text-accent-blue group-hover:translate-x-2 transition-smooth" />
            </div>
          </motion.div>
        ))}

        {workspaces.length === 0 && !isLoading && (
          <div className="col-span-full py-32 text-center glass-card">
            <Compass className="w-16 h-16 text-text-dim mx-auto mb-8 opacity-20" />
            <p className="text-xl text-text-dim mb-10">Your sanctuary is currently empty.</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="btn-primary max-w-xs mx-auto"
            >
              <Plus className="w-6 h-6" />
              <span>Orchestrate First Workspace</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
