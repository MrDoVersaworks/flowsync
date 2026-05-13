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

      // Refresh the board to show new tasks
      const boardRes = await api.get(`/kanban/${workspaceId}`);
      setBoard(boardRes.data.data.columns);
      
      toast.success(data.message);
      onClose();
      setGoal('');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'AI Breakdown failed';
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
            className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-panel p-8 w-full max-w-lg relative z-10 border-accent-gold/20"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-text-dim hover:text-white transition-smooth"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent-gold/10 rounded-lg">
                <Sparkles className="w-6 h-6 text-accent-gold" />
              </div>
              <h2 className="text-2xl font-bold text-white">AI Task Breakdown</h2>
            </div>

            <p className="text-text-secondary mb-6 leading-relaxed">
              Define a high-level goal, and your <span className="text-accent-gold">Sovereign Gemini</span> instance will split it into actionable Kanban tasks instantly.
            </p>

            <form onSubmit={handleBreakdown} className="space-y-6">
              <div className="relative">
                <Target className="absolute left-3 top-3 w-5 h-5 text-text-dim" />
                <textarea
                  autoFocus
                  placeholder="e.g. Build a mobile-responsive landing page for a coffee shop..."
                  rows={4}
                  className="w-full bg-bg-primary border border-border-color rounded-md py-3 pl-11 pr-4 focus:outline-none focus:border-accent-gold transition-smooth resize-none"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-gold hover:bg-accent-gold-hover text-bg-primary font-bold py-3 rounded-md transition-smooth flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Sub-Tasks
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
