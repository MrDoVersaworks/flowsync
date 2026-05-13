'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import KanbanTask from './KanbanTask';
import { Plus, MoreHorizontal, Sparkles } from 'lucide-react';
import { Task } from '@/store/useWorkspaceStore';
import AIBreakdownModal from './AIBreakdownModal';

interface ColumnProps {
  column: {
    id: string;
    workspace_id: string;
    title: string;
    tasks: Task[];
  };
}

export default function KanbanColumn({ column }: ColumnProps) {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex-shrink-0 w-[calc(100vw-3rem)] md:w-80 flex flex-col h-full snap-center md:snap-start">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-white tracking-wide">{column.title}</h3>
          <span className="bg-bg-surface px-2 py-0.5 rounded text-xs font-bold text-accent-gold border border-border-color">
            {column.tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="p-1.5 hover:bg-bg-surface rounded-md text-accent-gold/60 hover:text-accent-gold transition-smooth"
            title="AI Breakdown"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-bg-surface rounded-md text-text-dim hover:text-white transition-smooth">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-bg-surface rounded-md text-text-dim hover:text-white transition-smooth">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div 
        ref={setNodeRef}
        className="flex-1 min-h-[150px] bg-bg-secondary/40 rounded-xl p-2 border border-border-color/50 flex flex-col gap-3 overflow-y-auto"
      >
        <SortableContext 
          id={column.id}
          items={column.tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <KanbanTask key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      <AIBreakdownModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        workspaceId={column.workspace_id}
        columnId={column.id}
      />
    </div>
  );
}
