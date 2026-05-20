'use client';

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column } from '@/store/useWorkspaceStore';
import KanbanTask from './KanbanTask';
import { Plus, MoreHorizontal, Trash2, Sparkles, X, Layout, Hash, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useState } from 'react';

interface Props {
  column: Column;
  isViewer?: boolean;
}

export default function KanbanColumn({ column, isViewer }: Props) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = column.tasks.filter(t => 
    t && t.id &&
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())))
  );

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
    disabled: isViewer || filteredTasks.length < 2
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const { data } = await api.post(`/kanban/${column.workspace_id}/tasks`, {
        columnId: column.id,
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        position: column.tasks.length
      });

      const state = useWorkspaceStore.getState();
      const newBoard = state.board.map(col => 
        col.id === column.id ? { ...col, tasks: [...col.tasks, data.data] } : col
      );
      state.setBoard(newBoard);
      setNewTaskTitle('');
      setIsTaskModalOpen(false);
      toast.success('Task Incepted');
    } catch (error) {
      toast.error('Task inception failed');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-[85vw] sm:w-80 md:w-96 max-w-[380px] flex flex-col h-full max-h-full min-h-0 shrink-0 group ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Column Header */}
      <div 
        className={`flex items-center justify-between p-5 mb-4 glass rounded-2xl border border-border-color group-hover:border-accent-blue/30 transition-smooth ${isViewer ? 'cursor-default' : 'cursor-default'}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            [
              'bg-accent-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]',
              'bg-accent-purple shadow-[0_0_10px_rgba(168,85,247,0.5)]',
              'bg-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]',
              'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
              'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
              'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
            ][(column.position || 0) % 6]
          }`} />
          <div className="overflow-hidden">
            <h3 className={`text-sm font-black text-foreground uppercase tracking-tight font-display ${column.title.length > 22 ? 'animate-marquee' : 'truncate'}`}>
              {column.title}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="text-[10px] font-black text-text-dim bg-bg-secondary px-2.5 py-1 rounded-lg border border-border-color/50">
            {column.tasks.length}
          </span>
          <div className="flex items-center gap-1">
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
      </div>

      {/* Search Input */}
      <div className="px-1 mb-4">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim group-focus-within:text-accent-blue transition-smooth" />
          <input
            type="text"
            placeholder="Search tasks in column..."
            className="w-full bg-bg-secondary border border-border-color rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent-blue/50 transition-smooth"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Task List Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 pr-2 custom-scrollbar min-h-[150px]">
        <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {filteredTasks.map((task) => (
            <KanbanTask key={task.id} task={task} isViewer={isViewer} />
          ))}
        </SortableContext>
        
        {!isViewer && (
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsTaskModalOpen(true)}
              className="flex-1 py-3 md:py-4 border-2 border-dashed border-border-color rounded-2xl text-text-dim hover:text-foreground hover:border-accent-blue/50 hover:bg-bg-secondary transition-smooth flex items-center justify-center gap-2 group/add"
            >
              <Plus className="w-4 h-4 md:w-5 h-5 group-hover/add:rotate-90 transition-smooth" />
              <span className="text-xs md:text-sm font-bold">Incept Task</span>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                const goal = prompt(`Orchestrate specifically for "${column.title}":`);
                if (goal) {
                  const promise = api.post('/ai/breakdown', { workspaceId: column.workspace_id, goal, targetColumnId: column.id });
                  toast.promise(promise, {
                    loading: 'Synchronizing Intelligence...',
                    success: 'Targeted Inception Complete',
                    error: (err: any) => err.response?.data?.error?.message || 'Inception Failed'
                  });

                  promise.then(({ data }) => {
                    const state = useWorkspaceStore.getState();
                    const newTasks = data.data;
                    const newBoard = state.board.map(col => 
                      col.id === column.id ? { ...col, tasks: [...col.tasks, ...newTasks] } : col
                    );
                    state.setBoard(newBoard);
                  });
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

      {/* TASK INCEPTION MODAL */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card p-10 relative z-10"
            >
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="absolute top-6 right-6 text-text-dim hover:text-foreground"
                aria-label="Close Task Modal"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center">
                    <Hash className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">Incept Technical Task</h2>
                    <p className="text-text-secondary text-sm">Orchestrate a new mission for <span className="text-accent-blue font-bold">"{column.title}"</span>.</p>
                  </div>
                </div>

                <form onSubmit={handleAddTask} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest pl-1">Task Title / AI Goal</label>
                      <input 
                        type="text"
                        placeholder="e.g., Implement Sovereign Middleware"
                        className="w-full bg-bg-secondary border border-border-color rounded-xl px-4 py-3 text-foreground focus:border-accent-blue/50 outline-none transition-smooth"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pl-1">
                        <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Description (Optional)</label>
                        <span className="text-[10px] text-text-dim/50 italic">Manual Mode Only</span>
                      </div>
                      <textarea 
                        placeholder="Technical details..."
                        className="w-full bg-bg-secondary border border-border-color rounded-xl px-4 py-3 text-foreground focus:border-accent-blue/50 outline-none transition-smooth resize-none h-24"
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest pl-1">Priority</label>
                      <select
                        className="w-full bg-bg-secondary border border-border-color rounded-xl px-4 py-3 text-foreground focus:border-accent-blue/50 outline-none transition-smooth appearance-none"
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button 
                      type="submit"
                      disabled={isCreating}
                      className="w-full py-4 bg-accent-blue hover:bg-accent-blue/80 text-foreground font-bold rounded-xl transition-smooth shadow-lg shadow-accent-blue/20 disabled:opacity-50"
                    >
                      {isCreating ? 'Synchronizing...' : 'Confirm Inception'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
