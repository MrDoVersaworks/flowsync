import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Flag, AlignLeft, Trash2, Clock, CheckCircle2, MessageSquare, Send, Sparkles } from 'lucide-react';
import { Task, useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
  };
}

interface Props {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  isViewer?: boolean;
}

export default function TaskModal({ task, isOpen, onClose, isViewer }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [isSaving, setIsSaving] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const { user } = useAuthStore();
  const { board, setBoard, activeWorkspace } = useWorkspaceStore();
  const isOwner = activeWorkspace?.owner_id === user?.id;

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      api.post(`/comments/read/${task.id}`).then(() => {
        // Clear unread count locally
        const newBoard = board.map(col => ({
          ...col,
          tasks: col.tasks.map(t => t.id === task.id ? { ...t, unread_count: 0 } : t)
        }));
        setBoard(newBoard);
      }).catch(() => {});
      
      // Real-time comment refresh
      const handleBoardUpdate = (data: any) => {
        if (data?.taskId === task.id && (data?.type === 'COMMENT_ADDED' || data?.type === 'COMMENT_DELETED' || data?.type === 'COMMENTS_PURGED')) {
          fetchComments();
        }
      };

      const { socketService } = require('@/lib/socket');
      const { SocketEvent } = require('@/constants');
      socketService.on(SocketEvent.BOARD_UPDATED, handleBoardUpdate);

      return () => {
        socketService.off(SocketEvent.BOARD_UPDATED, handleBoardUpdate);
      };
    }
  }, [isOpen, task.id]);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/comments/${task.id}`);
      setComments(data.data);
    } catch (error) {
      console.error('Failed to fetch comments');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      await api.post(`/comments/${task.id}`, { content: newComment });
      setNewComment('');
      fetchComments();
      toast.success('Comment Synchronized');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      toast.success('Note Purged');
      fetchComments();
    } catch (error) {
      toast.error('Purge failed');
    }
  };

  const handlePurgeFeed = async () => {
    if (confirm('Wipe the entire technical reconciliation feed? This action is irreversible.')) {
      try {
        await api.delete(`/comments/task/${task.id}`);
        toast.success('Feed Wiped');
        fetchComments();
      } catch (error) {
        toast.error('Wipe failed');
      }
    }
  };

  const handleUpdate = async () => {
    if (isViewer) return;
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
    if (isViewer) return;
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

  const handleEnrich = async () => {
    if (!title.trim() || isEnriching) return;
    setIsEnriching(true);
    try {
      const column = board.find(c => c.id === task.column_id);
      const { data } = await api.post('/ai/enrich-task', { 
        title, 
        columnTitle: column?.title 
      });
      setDescription(data.data);
      toast.success('Technical Context Enriched');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Enrichment failed');
    } finally {
      setIsEnriching(false);
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
                  Technical Context • {task.id.slice(0, 8)}
                </span>
              </div>
              <button onClick={onClose} className="text-text-dim hover:text-foreground transition-smooth">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <textarea 
                  value={title}
                  disabled={isViewer}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent text-2xl md:text-3xl font-bold text-foreground outline-none focus:text-accent-blue transition-smooth font-display tracking-tight disabled:opacity-80 resize-none overflow-hidden"
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
                    disabled={isViewer}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-color rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:border-accent-blue transition-smooth appearance-none disabled:opacity-50"
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
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-widest">
                    <AlignLeft className="w-3 h-3" /> Technical Breakdown
                  </label>
                  {!isViewer && (
                    <button 
                      onClick={handleEnrich}
                      disabled={isEnriching || !title.trim()}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-accent-cyan hover:text-accent-cyan/80 transition-smooth uppercase tracking-widest disabled:opacity-50"
                      title="Enrich with AI"
                    >
                      {isEnriching ? (
                        <span className="w-3 h-3 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Enrich with AI
                    </button>
                  )}
                </div>
                <textarea 
                  value={description}
                  disabled={isViewer}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-color rounded-2xl p-6 text-sm text-text-secondary leading-relaxed outline-none focus:border-accent-blue transition-smooth min-h-[150px] resize-none disabled:opacity-80"
                  placeholder="Describe the technical requirements for this task..."
                />
              </div>

              {/* Collaborative Comments Section */}
              <div className="space-y-6 pt-6 border-t border-border-color/30">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-widest">
                    <MessageSquare className="w-3 h-3" /> Collaborative Reconciliation
                  </label>
                  {isOwner && comments.length > 0 && (
                    <button 
                      onClick={handlePurgeFeed}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-red-500/20 transition-smooth flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" /> Purge Feed
                    </button>
                  )}
                </div>
                
                {/* Comment Feed */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-bg-secondary/30 rounded-2xl p-4 border border-border-color/20 relative group/comment flex gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-accent-blue tracking-tight uppercase">{comment.user.name}</span>
                            <span className="text-[10px] text-text-dim font-medium">{new Date(comment.created_at).toLocaleTimeString()}</span>
                          </div>
                          {(comment.user.id === user?.id || isOwner) && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1.5 text-text-dim hover:text-red-500 transition-smooth opacity-0 group-hover/comment:opacity-100"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed break-words">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {comments.length === 0 && (
                    <p className="text-xs text-text-dim italic py-4 text-center">No technical reconciliation recorded yet.</p>
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleAddComment} className="relative">
                  <input 
                    type="text"
                    value={newComment}
                    disabled={isViewer}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={isViewer ? "Viewing Reconciliation Feed..." : "Add a technical note..."}
                    className="w-full bg-bg-secondary border border-border-color rounded-xl pl-4 pr-12 py-3 text-sm text-foreground outline-none focus:border-accent-blue transition-smooth disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={isCommenting || !newComment.trim() || isViewer}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent-blue hover:text-accent-blue/80 transition-smooth disabled:opacity-30"
                  >
                    {isCommenting ? <span className="w-4 h-4 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 border-t border-border-color bg-bg-secondary/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              {!isViewer && (
                <button 
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-text-dim hover:text-red-500 transition-smooth text-xs font-bold uppercase tracking-widest"
                >
                  <Trash2 className="w-4 h-4" /> Purge Task
                </button>
              )}
              
              <div className="flex items-center gap-4 w-full sm:w-auto ml-auto">
                <button 
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-3 text-text-dim hover:text-foreground font-bold text-xs uppercase tracking-widest transition-smooth"
                >
                  {isViewer ? 'Close' : 'Cancel'}
                </button>
                {!isViewer && (
                  <button 
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-accent-blue text-white font-bold rounded-xl shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/90 transition-smooth disabled:opacity-50 text-xs uppercase tracking-widest"
                  >
                    {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
