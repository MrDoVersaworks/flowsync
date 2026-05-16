'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layout, ArrowRight, Loader2, Sparkles, Trash2, Info, Users, Copy, Check, Compass, ChevronRight, X } from 'lucide-react';
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
  const [workspaceToDelete, setWorkspaceToDelete] = useState<{ id: string, name: string } | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
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

  const handleDeleteClick = (workspace: { id: string, name: string }, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWorkspaceToDelete(workspace);
    setDeletePassword('');
  };

  const confirmDelete = async () => {
    if (!workspaceToDelete || !deletePassword) return;
    
    setDeletingId(workspaceToDelete.id);
    try {
      await api.delete(`/workspaces/${workspaceToDelete.id}`, { 
        data: { password: deletePassword } 
      });
      setWorkspaces(workspaces.filter(ws => ws.id !== workspaceToDelete.id));
      toast.success('Workspace purged.');
      setWorkspaceToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to purge workspace. Verify credentials.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!mounted) return null;

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
                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-accent-blue transition-smooth font-display tracking-tight">
                    {workspace.name}
                  </h3>
                  
                  {((workspace as any).unread_count ?? 0) > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        {(workspace as any).unread_count} Intelligence Alerts
                      </span>
                    </div>
                  )}
                  
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

                <button
                  onClick={(e) => handleDeleteClick({ id: workspace.id, name: workspace.name }, e)}
                  disabled={deletingId === workspace.id}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-smooth hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] z-20"
                  title="Purge Workspace"
                >
                  {deletingId === workspace.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {workspaceToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWorkspaceToDelete(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card p-10 relative z-10 border-red-500/20"
            >
              <button 
                onClick={() => setWorkspaceToDelete(null)}
                className="absolute top-6 right-6 text-text-dim hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                    <Trash2 className="w-7 h-7 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground font-display">Purge Sanctuary</h2>
                    <p className="text-text-secondary text-sm">Destructive action detected for <span className="text-red-500 font-bold">{workspaceToDelete.name}</span>.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-4 text-center">
                    <p className="text-text-secondary text-xs leading-relaxed">
                      This will permanently delete all task data and columns. This action is irreversible.
                    </p>
                    
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest pl-1">Confirm with Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-bg-secondary border border-border-color rounded-xl px-4 py-3 text-foreground focus:border-red-500/50 outline-none transition-smooth text-sm"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        autoFocus
                      />
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <button 
                        onClick={confirmDelete}
                        disabled={deletingId === workspaceToDelete.id || !deletePassword}
                        className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-xl transition-smooth flex items-center justify-center gap-2 disabled:opacity-30"
                      >
                        {deletingId === workspaceToDelete.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        <span>Purge Sanctuary</span>
                      </button>
                      <button 
                        onClick={() => setWorkspaceToDelete(null)}
                        className="w-full py-2 text-text-dim hover:text-foreground text-xs font-bold transition-smooth"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
