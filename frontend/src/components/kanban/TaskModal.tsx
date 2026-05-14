'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, ShieldAlert, AlignLeft, Hash, Zap, Loader2 } from 'lucide-react';
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
  const { setBoard, board } = useWorkspaceStore();

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
  }, [task]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch(`/kanban/${task.workspace_id}/tasks/${task.id}`, {
        title,
        description,
        priority
      });
      
      // Local state update
      const newBoard = board.map(col => ({
        ...col,
        tasks: col.tasks.map(t => t.id === task.id ? { ...t, title, description, priority } : t)
      }));
      setBoard(newBoard);
      
      toast.success('Task Infrastructure Realigned');
      onClose();
    } catch (error) {
      toast.error('Failed to align task infrastructure');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
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
            className="w-full max-w-2xl glass-card relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-border-color flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent-blue/10 rounded-xl flex items-center justify-center">
                  <Hash className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Task Specifications</span>
                  <h2 className="text-xl font-bold text-foreground leading-none mt-1">STK-{task.id.substring(0, 8).toUpperCase()}</h2>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-lg transition-smooth text-text-dim hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold">Goal Identifier</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-color rounded-xl px-5 py-4 text-foreground text-lg font-bold focus:border-accent-blue/50 outline-none transition-smooth"
                  placeholder="Task title..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold">Priority Tier</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-bg-secondary border border-border-color rounded-xl px-5 py-3 text-foreground focus:border-accent-blue/50 outline-none transition-smooth appearance-none capitalize"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </select>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold">Infrastructure State</label>
                   <div className="px-5 py-3 bg-bg-secondary border border-border-color rounded-xl text-text-dim text-sm flex items-center gap-2">
                     <Zap className="w-4 h-4 text-accent-purple" />
                     <span>Active Sync</span>
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold">Technical Specifications</label>
                  <span className="text-[9px] text-accent-blue font-bold uppercase tracking-widest">Markdown Supported</span>
                </div>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-color rounded-xl px-5 py-4 text-text-secondary min-h-[250px] focus:border-accent-blue/50 outline-none transition-smooth leading-relaxed text-sm resize-none"
                  placeholder="Detailed technical requirements, architectural notes, or implementation logic..."
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 bg-bg-secondary border-t border-border-color flex items-center justify-between">
              <button className="flex items-center gap-2 text-red-500/50 hover:text-red-500 text-xs font-bold transition-smooth">
                <Trash2 className="w-4 h-4" />
                <span>Decommission Task</span>
              </button>

              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-accent-blue hover:bg-accent-blue/90 text-foreground font-bold px-8 py-3 rounded-xl transition-smooth shadow-lg shadow-accent-blue/20 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Specifications</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
