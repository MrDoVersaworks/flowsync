'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { api } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { SocketEvent } from '@/constants';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { ChevronLeft, Settings, Share2, Loader2, Zap, Layout, X, Copy, Check, Trash2, ShieldAlert, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const { setBoard, setLoading, isLoading, activeWorkspace, workspaces, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [goal, setGoal] = useState('');
  const [isIncepting, setIsIncepting] = useState(false);
  const [activeMinds, setActiveMinds] = useState<{ userId: string, name: string, socketId: string }[]>([]);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const userRole = activeWorkspace?.members?.find(m => m.user_id === user?.id)?.role;
  const isViewer = userRole === 'viewer';

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/kanban/${id}`);
      setBoard(data.data.columns);
      
      socketService.connect();
      if (user) {
        socketService.joinWorkspace(id as string, { id: user.id, name: user.name });
      }
    } catch (error: unknown) {
      toast.error('Failed to load board');
      router.push('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (mounted && isAuthenticated) {
      fetchBoard();
      
      // Always fetch full detail to ensure members and roles are synchronized
      api.get(`/workspaces/${id}`).then(({ data }) => {
        setActiveWorkspace(data.data);
      }).catch(err => {
        console.error('Failed to fetch workspace metadata', err);
      });
    }

    const handleUpdate = (data: any) => {
      if (data?.workspaceId === id) {
        fetchBoard();
        if (data?.type === 'MEMBER_UPDATED' || data?.type === 'MEMBER_PURGED') {
          api.get(`/workspaces/${id}`).then(({ data }) => {
            setActiveWorkspace(data.data);
          }).catch(() => {});
        }
      }
    };

    socketService.on(SocketEvent.BOARD_UPDATED, handleUpdate);
    socketService.on(SocketEvent.PRESENCE_UPDATED, (members: any) => {
      setActiveMinds(members);
    });

    return () => {
      socketService.off(SocketEvent.BOARD_UPDATED);
      socketService.off(SocketEvent.PRESENCE_UPDATED);
    };
  }, [id, workspaces, mounted, isAuthenticated]);

  const handleAIInception = async (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.length < 10) {
      toast.error('Goal must be at least 10 characters for orchestration.');
      return;
    }

    setIsIncepting(true);
    try {
      await api.post('/ai/breakdown', { workspaceId: id, goal });
      toast.success('Technical Plan Incepted');
      setGoal('');
      // Immediate refetch for instant gratification
      await fetchBoard();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'AI Orchestration failed.');
    } finally {
      setIsIncepting(false);
    }
  };

  const handleCopyCode = () => {
    if (activeWorkspace?.invite_code) {
      navigator.clipboard.writeText(activeWorkspace.invite_code);
      setCopied(true);
      toast.success('Sovereign Code Captured');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;
    if (!deletePassword) {
      toast.error('Identity verification required.');
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/workspaces/${activeWorkspace.id}`, { data: { password: deletePassword } });
      setWorkspaces(workspaces.filter(ws => ws.id !== activeWorkspace.id));
      toast.success('Workspace Purged');
      router.push('/workspaces');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Purge failed. Verify credentials.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6 bg-background">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-accent-blue animate-spin" />
          <div className="absolute inset-0 bg-accent-blue/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-text-secondary font-display text-lg tracking-widest uppercase animate-pulse">
          Synchronizing Consciousness...
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background relative">
      {/* Subtle Background Atmosphere */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-accent-blue/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-accent-purple/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Workspace Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between px-4 md:px-10 py-4 md:py-8 glass border-b border-border-color relative z-10 gap-4 md:gap-6 lg:flex-row lg:items-center"
      >
        <div className="flex items-center gap-3 md:gap-8">
          <button 
            onClick={() => router.push('/workspaces')}
            className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center glass hover:bg-bg-secondary rounded-lg md:rounded-2xl text-text-dim hover:text-foreground transition-smooth"
            title="Back to Sanctuary"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden min-[400px]:flex w-9 h-9 md:w-12 md:h-12 bg-accent-blue/10 rounded-lg md:rounded-2xl items-center justify-center">
              <Layout className="w-5 h-5 md:w-6 md:h-6 text-accent-blue" />
            </div>
            <div>
              <h1 className="text-lg md:text-3xl font-bold text-foreground leading-none mb-1 md:mb-2 font-display tracking-tight">
                {activeWorkspace?.name || 'Sanctuary'}
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-[7px] md:text-[10px] font-bold text-text-dim tracking-widest uppercase">
                  Live Sync
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* Presence Bar */}
          <div className="flex items-center -space-x-2 order-2 sm:order-1">
            {/* Deduplicate active minds by userId to prevent ghost tokens from multiple tabs */}
            {Array.from(new Map(activeMinds.map(m => [m.userId, m])).values()).slice(0, 5).map((mind, i) => (
              <motion.div
                key={mind.userId}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-7 h-7 md:w-9 md:h-9 rounded-full border-2 border-background flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white shadow-lg relative group`}
                style={{ backgroundColor: `hsl(${(i * 45) % 360}, 60%, 45%)` }}
                title={mind.name}
              >
                {mind.name.charAt(0).toUpperCase()}
                <div className="absolute bottom-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-accent-cyan rounded-full border-2 border-background" />
                
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-foreground text-background text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none whitespace-nowrap z-50">
                  {mind.name} {mind.userId === user?.id ? '(You)' : ''}
                </div>
              </motion.div>
            ))}
            {Array.from(new Map(activeMinds.map(m => [m.userId, m])).values()).length > 5 && (
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-bg-secondary border-2 border-background flex items-center justify-center text-[8px] md:text-[10px] font-bold text-text-dim">
                +{Array.from(new Map(activeMinds.map(m => [m.userId, m])).values()).length - 5}
              </div>
            )}
          </div>

          <div className="flex items-center justify-start sm:justify-end gap-2 md:gap-4">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 glass hover:bg-bg-secondary text-[10px] md:text-sm font-bold transition-smooth text-text-secondary hover:text-foreground rounded-lg md:rounded-xl group"
          >
            <Share2 className="w-3.5 h-3.5 group-hover:scale-110 transition-smooth" />
            <span>Invite</span>
          </button>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center glass hover:bg-bg-secondary rounded-lg md:rounded-2xl text-text-dim hover:text-foreground transition-smooth"
          >
            <Settings className="w-4 h-4 md:w-6 md:h-6 text-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
      
      {/* AI Orchestration & Actions Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 md:px-10 py-4 md:py-6 bg-bg-secondary border-b border-border-color flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10"
      >
        <form onSubmit={handleAIInception} className="flex-1 relative group w-full">
          <div className="absolute inset-0 bg-accent-purple/5 blur-xl rounded-2xl group-hover:bg-accent-purple/10 transition-smooth" />
          <div className="relative flex items-center">
            <div className="absolute left-4 text-accent-purple">
              <Zap className="w-5 h-5 fill-accent-purple/20" />
            </div>
            <input 
              type="text"
              placeholder="Orchestrate Technical Goal..."
              className="w-full bg-bg-secondary border border-border-color rounded-xl md:rounded-2xl pl-12 pr-28 md:pr-32 py-3.5 md:py-4 text-foreground focus:border-accent-purple/50 outline-none transition-smooth text-xs md:text-sm font-medium"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            <button 
              type="submit"
              disabled={isIncepting || isViewer}
              className="absolute right-1.5 px-4 md:px-6 py-2 bg-accent-purple text-foreground rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs hover:bg-accent-purple/80 transition-smooth disabled:opacity-50 flex items-center gap-2"
            >
              {isIncepting ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              <span>{isViewer ? 'Read Only' : 'Incept'}</span>
            </button>
          </div>
        </form>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            disabled={isViewer}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3.5 md:py-4 glass hover:bg-bg-secondary text-xs md:text-sm font-bold text-foreground rounded-xl md:rounded-2xl transition-smooth border-accent-blue/20 hover:border-accent-blue/50 disabled:opacity-30"
            onClick={async () => {
              const title = prompt('Sanctuary Column Title:');
              if (title) {
                try {
                  const { data } = await api.post(`/kanban/${id}/columns`, { title });
                  const state = useWorkspaceStore.getState();
                  state.setBoard([...state.board, { ...data.data, tasks: [] }]);
                  toast.success('Column Orchestrated');
                } catch (error) {
                  toast.error('Orchestration failed');
                }
              }
            }}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5 text-accent-blue" />
            <span>Add Infrastructure Column</span>
          </button>
        </div>
      </motion.div>

      {/* Kanban Board Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-hidden p-4 md:p-10 relative z-10"
      >
        <KanbanBoard isViewer={isViewer} />
      </motion.div>

      {/* Modals Sanctuary */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card p-10 relative z-10"
            >
              <button 
                onClick={() => setShowInviteModal(false)}
                className="absolute top-6 right-6 text-text-dim hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto">
                  <Share2 className="w-10 h-10 text-accent-blue" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2 font-display">Expand the Sanctuary</h2>
                  <p className="text-text-secondary">Share this code with your team to orchestrate in real-time.</p>
                </div>

                <div className="bg-bg-secondary border border-border-color p-6 rounded-2xl flex items-center justify-between group">
                  <span className="text-3xl font-mono font-bold text-foreground tracking-[0.2em]">
                    {activeWorkspace?.invite_code || '------'}
                  </span>
                  <button 
                    onClick={handleCopyCode}
                    className="p-3 bg-accent-blue/10 text-accent-blue rounded-xl hover:bg-accent-blue hover:text-foreground transition-smooth"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">
                  Mathematically unique • Secure Gateway
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card p-10 relative z-10"
            >
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-6 right-6 text-text-dim hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>

                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-bg-secondary rounded-2xl flex items-center justify-center">
                      <Settings className="w-7 h-7 text-text-dim" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground font-display">Workspace Settings</h2>
                      <p className="text-text-secondary text-sm">Configure your collaborative environment.</p>
                    </div>
                  </div>

                  {/* Member Management */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Sanctuary Members</h3>
                      <span className="text-[10px] font-bold text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                        {activeWorkspace?.members?.length || 0} Intelligence Links
                      </span>
                    </div>

                      <div className="space-y-3">
                        {activeWorkspace?.members?.map((member) => (
                          <div key={member.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg-secondary/30 rounded-2xl border border-border-color/50 gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue font-bold shrink-0">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">{member.name}</p>
                                <p className="text-[10px] text-text-dim truncate">{member.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 ml-14 sm:ml-0">
                              {activeWorkspace.owner_id === user?.id && member.user_id !== user?.id ? (
                                <>
                                  <select 
                                    value={member.role}
                                    onChange={async (e) => {
                                      try {
                                        await api.patch(`/workspaces/${activeWorkspace.id}/members/${member.user_id}`, { role: e.target.value });
                                        toast.success('Role Synchronized');
                                        // Refresh metadata
                                        const { data } = await api.get(`/workspaces/${activeWorkspace.id}`);
                                        setActiveWorkspace(data.data);
                                      } catch (error) {
                                        toast.error('Failed to update role');
                                      }
                                    }}
                                    className="bg-bg-secondary border border-border-color rounded-lg px-2 py-1 text-[10px] font-bold text-foreground outline-none focus:border-accent-blue transition-smooth"
                                  >
                                    <option value="viewer">Viewer</option>
                                    <option value="member">Contributor</option>
                                    <option value="admin">Contributor</option>
                                  </select>
                                  <button 
                                    onClick={async () => {
                                      if (confirm(`Purge ${member.name} from this sanctuary?`)) {
                                        try {
                                          await api.delete(`/workspaces/${activeWorkspace.id}/members/${member.user_id}`);
                                          toast.success('Member Purged');
                                          const { data } = await api.get(`/workspaces/${activeWorkspace.id}`);
                                          setActiveWorkspace(data.data);
                                        } catch (error) {
                                          toast.error('Purge failed');
                                        }
                                      }
                                    }}
                                    className="p-2 text-text-dim hover:text-red-500 transition-smooth"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-3 py-1 bg-bg-secondary rounded-lg">
                                  {member.user_id === activeWorkspace.owner_id ? 'Owner' : member.role === 'viewer' ? 'Viewer' : 'Contributor'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-border-color/30">
                    <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-4">
                      <div className="flex items-center gap-3 text-red-500">
                        <ShieldAlert className="w-5 h-5" />
                        <h3 className="font-bold">Danger Zone</h3>
                      </div>
                      <p className="text-text-secondary text-xs leading-relaxed">
                        Deleting this workspace will permanently purge all columns, tasks, and member history. This action is irreversible.
                      </p>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest pl-1">Confirm with Password</label>
                        <input 
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-bg-secondary border border-red-500/20 rounded-xl px-4 py-3 text-foreground focus:border-red-500/50 outline-none transition-smooth text-sm"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                        />
                      </div>

                      <button 
                        onClick={handleDeleteWorkspace}
                        disabled={isDeleting || !deletePassword}
                        className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-foreground font-bold rounded-xl transition-smooth flex items-center justify-center gap-2 disabled:opacity-30"
                      >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        <span>Purge Workspace</span>
                      </button>
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
