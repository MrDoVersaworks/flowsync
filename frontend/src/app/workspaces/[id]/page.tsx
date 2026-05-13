'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { api } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { SocketEvent } from '@/constants';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { ChevronLeft, Settings, Share2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        
        // Join WebSocket room
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

    // Listen for real-time updates
    socketService.on(SocketEvent.TASK_MOVED, (data) => {
      // In Phase 3, we will implement the optimistic merge logic here
      console.log('Real-time move received:', data);
    });

    return () => {
      socketService.off(SocketEvent.TASK_MOVED);
    };
  }, [id, setBoard, setLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="w-12 h-12 text-accent-gold animate-spin" />
        <p className="text-text-secondary font-medium">Synchronizing Reality...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Workspace Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-border-color bg-bg-secondary/20">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-bg-surface rounded-full text-text-dim hover:text-white transition-smooth"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white leading-none mb-1">
              {activeWorkspace?.name || 'Workspace'}
            </h1>
            <p className="text-xs text-text-dim font-mono tracking-widest uppercase">
              Production Environment • Live
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-bg-surface hover:bg-bg-surface-hover border border-border-color rounded-md text-sm font-medium transition-smooth text-text-secondary hover:text-white">
            <Share2 className="w-4 h-4" />
            Invite
          </button>
          <button className="p-2.5 bg-bg-surface hover:bg-bg-surface-hover border border-border-color rounded-md text-text-dim hover:text-white transition-smooth">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-hidden p-8 bg-bg-primary">
        <KanbanBoard />
      </div>
    </div>
  );
}
