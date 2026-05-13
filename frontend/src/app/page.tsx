'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import AuthForm from '@/components/auth/AuthForm';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Plus, Users, Hash, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-6">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}</h2>
          <p className="text-text-secondary">Select a workspace to start syncing your tasks.</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-accent-gold hover:bg-accent-gold-hover text-bg-primary font-bold px-6 py-2.5 rounded-md transition-smooth flex items-center gap-2"
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
            className="glass-panel p-6 mb-12 border-accent-gold/30"
          >
            <form onSubmit={handleCreateWorkspace} className="flex flex-col md:flex-row gap-4">
              <input 
                autoFocus
                type="text"
                placeholder="Workspace Name (e.g. Project X)"
                className="flex-1 bg-bg-primary border border-border-color rounded-md px-4 py-2 focus:outline-none focus:border-accent-gold transition-smooth"
                value={newWsName}
                onChange={e => setNewWsName(e.target.value)}
              />
              <div className="flex gap-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-accent-gold text-bg-primary font-bold px-6 py-2 rounded-md hover:bg-accent-gold-hover transition-smooth flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-bg-surface text-text-secondary px-6 py-2 rounded-md hover:text-white transition-smooth"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <motion.div 
            key={ws.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setActiveWorkspace(ws);
              router.push(`/workspaces/${ws.id}`);
            }}
            className="glass-panel p-6 cursor-pointer group hover:border-accent-gold/50"
          >
            <div className="w-12 h-12 bg-accent-gold/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-gold/20 transition-smooth">
              <Hash className="w-6 h-6 text-accent-gold" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-gold transition-smooth">{ws.name}</h3>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-color/30">
              <div className="flex items-center gap-2 text-xs text-text-dim">
                <Users className="w-4 h-4" />
                <span>Invite Code: <span className="text-white font-mono">{ws.invite_code}</span></span>
              </div>
              <ArrowRight className="w-4 h-4 text-text-dim group-hover:text-accent-gold group-hover:translate-x-1 transition-smooth" />
            </div>
          </motion.div>
        ))}

        {workspaces.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center glass-panel">
            <p className="text-text-secondary mb-4">You don't have any workspaces yet.</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="text-accent-gold hover:underline font-medium"
            >
              Create your first one now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
