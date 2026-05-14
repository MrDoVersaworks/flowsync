'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, Target } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface AIBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  columnId: string;
}

export default function AIBreakdownModal({ isOpen, onClose, workspaceId, columnId }: AIBreakdownModalProps) {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setBoard } = useWorkspaceStore();

  const handleBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsLoading(true);
    try {
      const { data } = await api.post('/ai/breakdown', {
        workspaceId,
        columnId,
        goal,
      });

      const boardRes = await api.get(`/kanban/${workspaceId}`);
      setBoard(boardRes.data.data.columns);
      
      toast.success(data.message);
      onClose();
      setGoal('');
    } catch (error: unknown) {
      // Type-safe error extraction
      const message = (error as any)?.response?.data?.error?.message || 'AI Breakdown failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
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
            className="glass-card p-10 w-full max-w-lg relative z-10 border-accent-blue/20"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-text-dim hover:text-foreground transition-smooth"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-accent-blue/10 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent-blue" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground font-display tracking-tight">AI Orchestration</h2>
                <p className="text-xs text-text-dim font-bold tracking-widest uppercase">Powered by Sovereign Gemini</p>
              </div>
            </div>

            <p className="text-text-secondary mb-8 leading-relaxed text-lg font-light">
              Define a high-level goal, and the <span className="text-accent-blue font-semibold">Gemini Nerve System</span> will orchestrate it into actionable tasks.
            </p>

            <form onSubmit={handleBreakdown} className="space-y-8">
              <div className="relative">
                <Target className="absolute left-4 top-4 w-6 h-6 text-text-dim" />
                <textarea
                  autoFocus
                  placeholder="e.g. Build a mobile-responsive sanctuary for high-performance minds..."
                  rows={4}
                  className="auth-input pl-14 pt-4 resize-none min-h-[140px]"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center justify-center gap-3 shadow-2xl shadow-accent-blue/40"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Sub-Tasks</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
