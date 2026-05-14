'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layout, ArrowRight, Loader2, Sparkles, Trash2, Info, Users, Copy, Check, Compass, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function WorkspacesPage() {
  const { workspaces, setWorkspaces, isLoading, setLoading } = useWorkspaceStore();
  const { isAuthenticated } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchWorkspaces = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/workspaces');
        setWorkspaces(data.data || []);
      } catch (error) {
        toast.error('Failed to sync workspaces');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [mounted, isAuthenticated, router, setLoading, setWorkspaces]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsCreating(true);
    try {
      const { data } = await api.post('/workspaces', { name: newWorkspaceName });
      setWorkspaces([...workspaces, data.data]);
      setNewWorkspaceName('');
      toast.success('Sanctuary Orchestrated!');
    } catch (error) {
      toast.error('Orchestration failed.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || joinCode.length !== 8) {
      toast.error('Invite code must be exactly 8 characters');
      return;
    }
    
    setIsJoining(true);
    try {
      const { data } = await api.post('/workspaces/join', { inviteCode: joinCode.toUpperCase() });
      setWorkspaces([...workspaces, data.data]);
      setJoinCode('');
      toast.success('Joined Sanctuary Successfully');
      router.push(`/workspaces/${data.data.id}`);
    } catch (error) {
      toast.error('Could not join sanctuary. Verify the code.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDeletingId(id);
    try {
      await api.delete(`/workspaces/${id}`);
      setWorkspaces(workspaces.filter(ws => ws.id !== id));
      toast.success('Workspace purged.');
    } catch (error) {
      toast.error('Failed to purge workspace.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12 mb-12 md:mb-20">
          <div className="flex-1">
            <h1 className="text-3xl md:text-6xl font-bold text-foreground font-display tracking-tight mb-3 md:mb-4">
              Your Sanctuaries
            </h1>
            <p className="text-text-secondary text-base md:text-xl max-w-2xl leading-relaxed">
              Orchestrate your technical goals or synchronize with a collaborative mission using a sovereign invite code.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full lg:w-auto">
            <form onSubmit={handleCreate} className="relative group w-full sm:w-64">
              <input
                type="text"
                placeholder="Orchestrate New..."
                className="glass-panel w-full px-5 md:px-6 py-3 md:py-4 text-sm md:text-base text-foreground focus:outline-none focus:border-accent-blue/50 transition-smooth rounded-xl md:rounded-2xl bg-bg-secondary border-border-color"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isCreating}
                className="absolute right-1.5 top-1.5 p-2 bg-accent-blue text-foreground rounded-lg md:rounded-xl hover:bg-accent-blue/80 transition-smooth disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </form>

            <form onSubmit={handleJoin} className="relative group w-full sm:w-64">
              <input
                type="text"
                placeholder="Join Code (8 chars)"
                className="glass-panel w-full px-5 md:px-6 py-3 md:py-4 text-sm md:text-base text-foreground focus:outline-none focus:border-accent-purple/50 transition-smooth rounded-xl md:rounded-2xl bg-bg-secondary border-border-color"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                required
              />
              <button
                type="submit"
                disabled={isJoining}
                className="absolute right-1.5 top-1.5 p-2 bg-accent-purple text-foreground rounded-lg md:rounded-xl hover:bg-accent-purple/80 transition-smooth disabled:opacity-50"
              >
                {isJoining ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </form>
          </div>
        </header>

        {/* Sovereign Guide: Instructions */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/guide#orchestrate" className="glass-card p-6 border-accent-blue/20 bg-accent-blue/5 hover:bg-accent-blue/10 transition-smooth group">
            <div className="flex items-center gap-3 mb-4 text-accent-blue">
              <Sparkles className="w-5 h-5 group-hover:scale-110 transition-smooth" />
              <h3 className="font-bold uppercase tracking-widest text-[10px]">Step 1</h3>
            </div>
            <h4 className="text-foreground font-bold mb-2">Orchestrate</h4>
            <p className="text-text-dim text-sm leading-relaxed">Create a sanctuary for your project. This is your command center for AI-driven Kanban.</p>
          </Link>
          <Link href="/guide#collaborate" className="glass-card p-6 border-accent-purple/20 bg-accent-purple/5 hover:bg-accent-purple/10 transition-smooth group">
            <div className="flex items-center gap-3 mb-4 text-accent-purple">
              <Users className="w-5 h-5 group-hover:scale-110 transition-smooth" />
              <h3 className="font-bold uppercase tracking-widest text-[10px]">Step 2</h3>
            </div>
            <h4 className="text-foreground font-bold mb-2">Collaborate</h4>
            <p className="text-text-dim text-sm leading-relaxed">Enter a workspace and use the "Invite" code to synchronize with your team in real-time.</p>
          </Link>
          <Link href="/guide#synchronize" className="glass-card p-6 border-accent-cyan/20 bg-accent-cyan/5 hover:bg-accent-cyan/10 transition-smooth group">
            <div className="flex items-center gap-3 mb-4 text-accent-cyan">
              <Layout className="w-5 h-5 group-hover:scale-110 transition-smooth" />
              <h3 className="font-bold uppercase tracking-widest text-[10px]">Step 3</h3>
            </div>
            <h4 className="text-foreground font-bold mb-2">Synchronize</h4>
            <p className="text-text-dim text-sm leading-relaxed">Use AI Breakdown to transform high-level goals into executable Kanban task flows.</p>
          </Link>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-accent-blue animate-spin" />
          </div>
        ) : workspaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-32 text-center flex flex-col items-center justify-center border-dashed border-border-color"
          >
            <div className="w-24 h-24 bg-accent-blue/10 rounded-full flex items-center justify-center mb-8">
              <Compass className="w-12 h-12 text-accent-blue" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">The Void is Waiting</h2>
            <p className="text-text-secondary text-lg max-w-md mb-12">
              You haven't orchestrated any workspaces yet. Use the command bar above to start your first flow.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {workspaces.map((workspace, index) => (
              <motion.div
                key={workspace.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <Link 
                  href={`/workspaces/${workspace.id}`}
                  className="glass-card p-10 flex flex-col h-full hover:border-accent-blue/50 transition-smooth group shadow-2xl"
                >
                  <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-smooth">
                    <Layout className="w-8 h-8 text-accent-blue" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-accent-blue transition-smooth font-display tracking-tight">
                    {workspace.name}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between pt-8 border-t border-border-color">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                      <span className="text-xs text-text-dim uppercase tracking-widest font-bold">
                        {workspace.invite_code}
                      </span>
                    </div>
                    <ArrowRight className="w-6 h-6 text-text-dim group-hover:text-accent-blue group-hover:translate-x-2 transition-smooth" />
                  </div>
                </Link>

                {/* Absolute Purge Action */}
                <button
                  onClick={(e) => handleDelete(workspace.id, e)}
                  disabled={deletingId === workspace.id}
                  className="absolute top-6 right-6 p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-smooth hover:bg-red-500 hover:text-foreground z-20"
                  title="Purge Workspace"
                >
                  {deletingId === workspace.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
