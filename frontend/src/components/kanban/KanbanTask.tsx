'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/store/useWorkspaceStore';
import { Calendar, Hash, AlignLeft, Sparkles, Trash2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
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

  const isAIGenerated = task.description?.includes('[AI]');

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className={`
          relative p-5 glass-card group 
          border-border-color hover:border-accent-blue/30 transition-smooth
          ${isDragging ? 'opacity-30' : ''}
          ${isOverlay ? 'shadow-2xl shadow-accent-blue/20 ring-2 ring-accent-blue/50' : ''}
          ${isViewer ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
        `}
      >
        {/* Absolute Purge Action */}
        {!isOverlay && !isViewer && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm('Purge this task?')) {
                try {
                  const { api } = await import('@/lib/api');
                  const { useWorkspaceStore } = await import('@/store/useWorkspaceStore');
                  const { toast } = await import('react-hot-toast');
                  
                  await api.delete(`/kanban/${task.workspace_id}/tasks/${task.id}`);
                  
                  const state = useWorkspaceStore.getState();
                  const newBoard = state.board.map(col => ({
                    ...col,
                    tasks: col.tasks.filter(t => t.id !== task.id)
                  }));
                  state.setBoard(newBoard);
                  toast.success('Task Purged');
                } catch (error) {
                  console.error(error);
                }
              }
            }}
            className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-smooth hover:scale-110 shadow-lg z-20"
            title="Purge Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* AI Glow Effect */}
        {isAIGenerated && (
          <div className="absolute top-0 right-0 w-12 h-12 bg-accent-purple/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        )}

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground leading-tight group-hover:text-accent-blue transition-smooth">
              {task.title}
            </h4>
            {isAIGenerated && <Sparkles className="w-4 h-4 text-accent-purple shrink-0" />}
          </div>

          {task.description && (
            <p className="text-xs text-text-dim line-clamp-2 leading-relaxed">
              {task.description.replace('[AI]', '').trim()}
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border-color">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[10px] font-bold text-text-dim bg-bg-secondary px-2 py-0.5 rounded-md uppercase tracking-wider">
                <Hash className="w-3 h-3" />
                <span>STK-{task.id.substring(0, 4).toUpperCase()}</span>
              </div>
              {((task as any).unread_count ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-md border border-accent-cyan/20 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                  <span>{(task as any).unread_count} Unread</span>
                </div>
              )}
              {((task as any).unread_count ?? 0) === 0 && ((task as any).comment_count ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-text-dim bg-bg-secondary px-2 py-0.5 rounded-md">
                  <MessageSquare className="w-3 h-3" />
                  <span>{(task as any).comment_count}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full`} style={{ 
                 backgroundColor: 
                   task.priority === 'urgent' ? 'var(--priority-urgent)' :
                   task.priority === 'high' ? 'var(--priority-high)' :
                   task.priority === 'medium' ? 'var(--priority-medium)' : 'var(--priority-low)'
               }} />
               <span className="text-[8px] font-bold text-text-dim uppercase">{task.priority}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <TaskModal 
        task={task} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isViewer={isViewer}
      />
    </>
  );
}
