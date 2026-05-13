'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { api } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { SocketEvent } from '@/constants';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { ChevronLeft, Settings, Share2, Loader2, Zap, Layout } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const { setBoard, setLoading, isLoading, activeWorkspace } = useWorkspaceStore();

  useEffect(() => {
    const fetchBoard = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/kanban/${id}`);
        setBoard(data.data.columns);
        
        socketService.connect();
        socketService.joinWorkspace(id as string);
      } catch (error: any) {
        toast.error('Failed to load board');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();

    socketService.on(SocketEvent.TASK_MOVED, (data) => {
      // Optimistic merge logic implemented in Board component
    });

    return () => {
      socketService.off(SocketEvent.TASK_MOVED);
    };
  }, [id, setBoard, setLoading, router]);

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
        className="flex items-center justify-between px-10 py-8 glass border-b border-white/5 relative z-10"
      >
        <div className="flex items-center gap-8">
          <button 
            onClick={() => router.push('/')}
            className="w-12 h-12 flex items-center justify-center glass hover:bg-white/5 rounded-2xl text-text-dim hover:text-white transition-smooth"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center">
              <Layout className="w-6 h-6 text-accent-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white leading-none mb-2 font-display tracking-tight">
                {activeWorkspace?.name || 'Sanctuary'}
              </h1>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-[10px] font-bold text-text-dim tracking-widest uppercase">
                  Production Environment • Live Sync
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-3 px-6 py-3 glass hover:bg-white/5 text-sm font-bold transition-smooth text-text-secondary hover:text-white rounded-xl group">
            <Share2 className="w-4 h-4 group-hover:scale-110 transition-smooth" />
            <span>Invite Collaborative Minds</span>
          </button>
          <button className="w-12 h-12 flex items-center justify-center glass hover:bg-white/5 rounded-2xl text-text-dim hover:text-white transition-smooth">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </motion.div>

      {/* Kanban Board Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-hidden p-10 relative z-10"
      >
        <KanbanBoard />
      </motion.div>
    </div>
  );
}
