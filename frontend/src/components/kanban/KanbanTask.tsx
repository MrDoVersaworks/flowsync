'use client';

import { Task } from '@/store/useWorkspaceStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import TaskModal from './TaskModal';

interface Props {
  task: Task;
  isOverlay?: boolean;
  isViewer?: boolean;
}

export default function KanbanTask({ task, isOverlay, isViewer }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { board, setBoard } = useWorkspaceStore();

  // Guard: skip rendering if task data is malformed (prevents white-screen crash)
  if (!task || !task.id) return null;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task
    },
    disabled: isOverlay || isViewer
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const priorityColors = {
    low: 'bg-green-500/10 text-green-500 border-green-500/20',
    medium: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  };

  const unreadCount = Number(task.unread_count) || 0;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-32 rounded-2xl border-2 border-dashed border-border-color bg-bg-secondary/50"
      />
    );
  }

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        whileHover={{ y: -4, scale: 1.01 }}
        onClick={() => setIsModalOpen(true)}
        className={`group relative glass-card p-5 cursor-pointer border border-border-color hover:border-accent-blue/50 transition-smooth select-none ${isOverlay ? 'shadow-2xl ring-2 ring-accent-blue/50 rotate-2' : ''}`}
      >
        {/* SOVEREIGN INTELLIGENCE BEACON */}
        {unreadCount > 0 && (
          <div className="absolute top-3 right-3 z-50" data-testid="task-beacon">
            <div className="relative flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute" />
              <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)] relative" />
              <div className="absolute top-4 right-0 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-smooth whitespace-nowrap pointer-events-none z-[60]">
                {unreadCount} NEW NOTES
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${priorityColors[task.priority]}`}>
            {task.priority}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-tighter flex items-center gap-1">
              <Hash className="w-3 h-3" />
              STK-{(task.id || '').slice(0, 4).toUpperCase()}
            </div>
            
            {!isViewer && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Purge this task?')) {
                    setIsDeleting(true);
                    api.delete(`/kanban/${task.workspace_id}/tasks/${task.id}`)
                      .then(() => {
                        const newBoard = board.map(col => ({
                          ...col,
                          tasks: col.tasks.filter(t => t.id !== task.id)
                        }));
                        setBoard(newBoard);
                        toast.success('Task Purged');
                      })
                      .catch(() => toast.error('Purge failed'))
                      .finally(() => setIsDeleting(false));
                  }
                }}
                disabled={isDeleting}
                className="p-1.5 text-text-dim hover:text-red-500 transition-smooth opacity-100 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-50"
                title="Purge Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="overflow-hidden">
            <h3 className={`text-base font-bold text-foreground leading-tight tracking-tight group-hover:text-accent-blue transition-smooth ${task.title.length > 20 ? 'animate-marquee hover:pause' : 'truncate'}`}>
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-color/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-text-dim group-hover:text-foreground transition-smooth">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{task.comment_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Subtle Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none rounded-2xl" />
      </motion.div>

      {isModalOpen && (
        <TaskModal 
          task={task} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          isViewer={isViewer}
        />
      )}
    </>
  );
}
