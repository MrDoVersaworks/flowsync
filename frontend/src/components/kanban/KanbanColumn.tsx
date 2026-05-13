'use client';

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Task } from '@/store/useWorkspaceStore';
import KanbanTask from './KanbanTask';
import { Plus, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  column: Column;
}

export default function KanbanColumn({ column }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column
    }
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-80 flex flex-col h-full shrink-0 group ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Column Header */}
      <div 
        {...attributes} 
        {...listeners}
        className="flex items-center justify-between p-4 mb-4 glass rounded-2xl cursor-grab active:cursor-grabbing border-white/5 group-hover:border-white/10 transition-smooth"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-blue" />
          <h3 className="font-bold text-white tracking-tight font-display">
            {column.title}
          </h3>
          <span className="text-[10px] font-bold text-text-dim px-2 py-0.5 bg-white/5 rounded-full">
            {column.tasks.length}
          </span>
        </div>
        <button className="text-text-dim hover:text-white transition-smooth p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Task List Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 pr-2 custom-scrollbar min-h-[150px]">
        <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <KanbanTask key={task.id} task={task} />
          ))}
        </SortableContext>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-text-dim hover:text-white hover:border-white/20 hover:bg-white/5 transition-smooth flex items-center justify-center gap-2 group/add"
        >
          <Plus className="w-5 h-5 group-hover/add:rotate-90 transition-smooth" />
          <span className="text-sm font-bold">Incept Task</span>
        </motion.button>
      </div>
    </div>
  );
}
