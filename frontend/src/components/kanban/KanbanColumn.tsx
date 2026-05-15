'use client';

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Task } from '@/store/useWorkspaceStore';
import KanbanTask from './KanbanTask';
import { Plus, MoreHorizontal, Trash2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface Props {
  column: Column;
  isViewer?: boolean;
}

export default function KanbanColumn({ column, isViewer }: Props) {
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
    },
    disabled: isViewer
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-[85vw] sm:w-80 md:w-96 max-w-[380px] flex flex-col h-full shrink-0 group ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Column Header */}
      <div 
        {...attributes} 
        {...listeners}
        className={`flex items-center justify-between p-4 mb-4 glass rounded-2xl border-border-color group-hover:border-border-color transition-smooth ${isViewer ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-blue" />
          <h3 className="font-bold text-foreground tracking-tight font-display">
            {column.title}
          </h3>
          <span className="text-[10px] font-bold text-text-dim px-2 py-0.5 bg-bg-secondary rounded-full">
            {column.tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isViewer && (
            <button 
              onClick={async (e) => {
                e.stopPropagation();
                if (confirm(`Purge the "${column.title}" column and all its contents? This action is irreversible.`)) {
                  try {
                    await api.delete(`/kanban/${column.workspace_id}/columns/${column.id}`);
                    const state = useWorkspaceStore.getState();
                    state.setBoard(state.board.filter(col => col.id !== column.id));
                    toast.success('Column Purged');
                  } catch (error) {
                    console.error(error);
                  }
                }
              }}
              className="text-text-dim hover:text-red-500 transition-smooth p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              title="Purge Column"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button className="text-text-dim hover:text-foreground transition-smooth p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Task List Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 pr-2 custom-scrollbar min-h-[150px]">
        <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <KanbanTask key={task.id} task={task} isViewer={isViewer} />
          ))}
        </SortableContext>
        
        {!isViewer && (
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                const title = prompt('Technical Task Title:');
                if (title) {
                  try {
                    const { data } = await api.post('/kanban/tasks', {
                      columnId: column.id,
                      title,
                      description: '',
                      priority: 'medium',
                      position: column.tasks.length
                    });

                    const state = useWorkspaceStore.getState();
                    const newBoard = state.board.map(col => 
                      col.id === column.id ? { ...col, tasks: [...col.tasks, data.data] } : col
                    );
                    state.setBoard(newBoard);
                    toast.success('Task Incepted');
                  } catch (error) {
                    console.error(error);
                  }
                }
              }}
              className="flex-1 py-3 md:py-4 border-2 border-dashed border-border-color rounded-2xl text-text-dim hover:text-foreground hover:border-accent-blue/50 hover:bg-bg-secondary transition-smooth flex items-center justify-center gap-2 group/add"
            >
              <Plus className="w-4 h-4 md:w-5 h-5 group-hover/add:rotate-90 transition-smooth" />
              <span className="text-xs md:text-sm font-bold">Incept Task</span>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                const goal = prompt(`Orchestrate for "${column.title}":\n(What specific tasks should be generated?)`);
                if (goal) {
                  try {
                    toast.loading('Orchestrating column focus...', { id: 'ai-column' });
                    await api.post('/ai/breakdown', {
                      workspaceId: column.workspace_id,
                      goal,
                      targetColumnId: column.id
                    });
                    toast.success('Column Orchestrated', { id: 'ai-column' });
                  } catch (error) {
                    toast.error('Orchestration failed', { id: 'ai-column' });
                    console.error(error);
                  }
                }
              }}
              className="w-12 h-11 md:h-14 border-2 border-dashed border-accent-cyan/30 rounded-2xl text-accent-cyan hover:bg-accent-cyan/10 transition-smooth flex items-center justify-center"
              title="Targeted AI Inception"
            >
              <Sparkles className="w-4 h-4 md:w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
