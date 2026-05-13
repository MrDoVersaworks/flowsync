'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, MessageSquare } from 'lucide-react';

interface TaskProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    due_date?: string | null;
  };
}

const priorityColors: Record<string, string> = {
  low: '#27ae60',
  medium: '#f39c12',
  high: '#e67e22',
  urgent: '#e74c3c',
};

export default function KanbanTask({ task }: TaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const priorityColor = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass-panel p-4 cursor-grab active:cursor-grabbing hover:border-accent-gold/50 group select-none"
    >
      {/* Priority Tag */}
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-2 h-2 rounded-full shadow-lg" 
          style={{ backgroundColor: priorityColor, boxShadow: `0 0 8px ${priorityColor}66` }}
        ></div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim group-hover:text-text-secondary transition-smooth">
          {task.priority}
        </span>
      </div>

      <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-text-dim mb-4 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-color/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-text-dim">
            <Calendar className="w-3 h-3" />
            <span>Aug 12</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-text-dim">
            <MessageSquare className="w-3 h-3" />
            <span>2</span>
          </div>
        </div>
        
        <div className="w-5 h-5 rounded-full bg-bg-surface border border-border-color flex items-center justify-center">
          <User className="w-3 h-3 text-text-dim" />
        </div>
      </div>
    </div>
  );
}
