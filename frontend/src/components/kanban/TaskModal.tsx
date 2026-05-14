'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Flag, AlignLeft, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { Task, useWorkspaceStore } from '@/store/useWorkspaceStore';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Props {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskModal({ task, isOpen, onClose }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [isSaving, setIsSaving] = useState(false);
  const { board, setBoard } = useWorkspaceStore();

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.patch(`/kanban/${task.workspace_id}/tasks/${task.id}`, {
        title,
        description,
        priority
      });
      
      const newBoard = board.map(col => ({
        ...col,
        tasks: col.tasks.map(t => t.id === task.id ? data.data : t)
      }));
      setBoard(newBoard);
      toast.success('Task Synchronized');
      onClose();
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Purge this task from the board?')) {
      try {
        await api.delete(`/kanban/${task.workspace_id}/tasks/${task.id}`);
        const newBoard = board.map(col => ({
          ...col,
          tasks: col.tasks.filter(t => t.id !== task.id)
        }));
        setBoard(newBoard);
        toast.success('Task Purged');
        onClose();
      } catch (error) {
        toast.error('Purge failed');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl glass-card overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-border-color flex items-center justify-between bg-bg-secondary/50">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  priority === 'urgent' ? 'bg-red-500' :
                  priority === 'high' ? 'bg-orange-500' :
                  priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim">
                  Infrastructure Task • {task.id.slice(0, 8)}
                </span>
              </div>
              <button onClick={onClose} className="text-text-dim hover:text-foreground transition-smooth">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-2xl md:text-3xl font-bold text-foreground outline-none focus:text-accent-blue transition-smooth font-display tracking-tight"
                  placeholder="Task Title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-widest">
                    <Flag className="w-3 h-3" /> Priority
                  </label>
                  <select 
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-color rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:border-accent-blue transition-smooth appearance-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-widest">
                    <Calendar className="w-3 h-3" /> Created
                  </label>
                  <div className="w-full bg-bg-secondary/30 border border-border-color/50 rounded-xl px-4 py-2 text-sm text-text-dim flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(task.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-widest">
                  <AlignLeft className="w-3 h-3" /> Technical Breakdown
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-color rounded-2xl p-6 text-sm text-text-secondary leading-relaxed outline-none focus:border-accent-blue transition-smooth min-h-[200px] resize-none"
                  placeholder="Describe the technical requirements for this task..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 border-t border-border-color bg-bg-secondary/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button 
                onClick={handleDelete}
                className="flex items-center gap-2 text-text-dim hover:text-red-500 transition-smooth text-xs font-bold uppercase tracking-widest"
              >
                <Trash2 className="w-4 h-4" /> Purge Task
              </button>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button 
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-3 text-text-dim hover:text-foreground font-bold text-xs uppercase tracking-widest transition-smooth"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-accent-blue text-white font-bold rounded-xl shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/90 transition-smooth disabled:opacity-50 text-xs uppercase tracking-widest"
                >
                  {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
