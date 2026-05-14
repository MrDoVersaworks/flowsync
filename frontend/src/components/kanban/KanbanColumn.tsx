'use client';

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Task } from '@/store/useWorkspaceStore';
import KanbanTask from './KanbanTask';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
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
      className={`w-[85vw] sm:w-80 md:w-96 max-w-[380px] flex flex-col h-full shrink-0 group ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Column Header */}
      <div 
        {...attributes} 
        {...listeners}
        className="flex items-center justify-between p-4 mb-4 glass rounded-2xl cursor-grab active:cursor-grabbing border-border-color group-hover:border-border-color transition-smooth"
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
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm(`Purge the "${column.title}" column and all its contents? This action is irreversible.`)) {
                try {
                  const { api } = await import('@/lib/api');
                  const { useWorkspaceStore } = await import('@/store/useWorkspaceStore');
                  const { toast } = await import('react-hot-toast');
                  
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
          <button className="text-text-dim hover:text-foreground transition-smooth p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
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
          onClick={async () => {
            const title = prompt('Technical Task Title:');
            if (title) {
              try {
                const { api } = await import('@/lib/api');
                const { useWorkspaceStore } = await import('@/store/useWorkspaceStore');
                const { toast } = await import('react-hot-toast');
                
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
          className="w-full py-4 border-2 border-dashed border-border-color rounded-2xl text-text-dim hover:text-foreground hover:border-accent-blue/50 hover:bg-bg-secondary transition-smooth flex items-center justify-center gap-2 group/add"
        >
          <Plus className="w-5 h-5 group-hover/add:rotate-90 transition-smooth" />
          <span className="text-sm font-bold">Incept Task</span>
        </motion.button>
      </div>
    </div>
  );
}
