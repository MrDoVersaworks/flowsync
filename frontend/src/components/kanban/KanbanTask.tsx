'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/store/useWorkspaceStore';
import { Calendar, Hash, AlignLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  task: Task;
  isOverlay?: boolean;
}

export default function KanbanTask({ task, isOverlay }: Props) {
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
    disabled: isOverlay
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const isAIGenerated = task.description?.includes('[AI]');

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`
        relative p-5 glass-card cursor-grab active:cursor-grabbing group 
        border-white/5 hover:border-accent-blue/30 transition-smooth
        ${isDragging ? 'opacity-30' : ''}
        ${isOverlay ? 'shadow-2xl shadow-accent-blue/20 ring-2 ring-accent-blue/50' : ''}
      `}
    >
      {/* AI Glow Effect */}
      {isAIGenerated && (
        <div className="absolute top-0 right-0 w-12 h-12 bg-accent-purple/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-white leading-tight group-hover:text-accent-blue transition-smooth">
            {task.title}
          </h4>
          {isAIGenerated && <Sparkles className="w-4 h-4 text-accent-purple shrink-0" />}
        </div>

        {task.description && (
          <p className="text-xs text-text-dim line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-text-dim bg-white/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
              <Hash className="w-3 h-3" />
              <span>STK-{task.id.substring(0, 4).toUpperCase()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center border border-accent-blue/30">
               <span className="text-[8px] font-bold text-accent-blue">AI</span>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
