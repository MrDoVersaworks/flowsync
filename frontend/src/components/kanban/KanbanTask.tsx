'use client';

import { Task } from '@/store/useWorkspaceStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  User,
  Hash
} from 'lucide-react';
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
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping absolute" />
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)] relative" />
              <div className="absolute -top-6 right-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-smooth whitespace-nowrap pointer-events-none">
                {unreadCount} UNREAD NOTES
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${priorityColors[task.priority]}`}>
            {task.priority}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-dim uppercase tracking-tighter">
            <Hash className="w-3 h-3" />
            STK-{task.id.slice(0, 4).toUpperCase()}
          </div>
        </div>

        <div className="mb-4">
          <div className="overflow-hidden">
            <h3 className={`text-base font-bold text-foreground leading-tight tracking-tight group-hover:text-accent-blue transition-smooth ${task.title.length > 28 ? 'animate-marquee hover:pause' : 'truncate'}`}>
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
            {task.due_date && (
              <div className="flex items-center gap-1.5 text-text-dim">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-bg-secondary border border-border-color flex items-center justify-center overflow-hidden">
              <User className="w-4 h-4 text-text-dim" />
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
