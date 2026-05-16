'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useWorkspaceStore, Column, Task } from '@/store/useWorkspaceStore';
import KanbanColumn from './KanbanColumn';
import KanbanTask from './KanbanTask';
import { Plus, Search, Filter, Sparkles, X, Layout, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isViewer?: boolean;
}

export default function KanbanBoard({ isViewer }: Props) {
  const { board, setBoard, activeWorkspace } = useWorkspaceStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // MODAL STATES
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const filteredBoard = useMemo(() => {
    if (!searchQuery.trim()) return board;
    return board.map(col => ({
      ...col,
      tasks: col.tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }));
  }, [board, searchQuery]);

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim() || !activeWorkspace) return;

    try {
      const { data } = await api.post(`/kanban/${activeWorkspace.id}/columns`, {
        title: newColumnTitle
      });
      setBoard([...board, { ...data.data, tasks: [] }]);
      setNewColumnTitle('');
      setIsColumnModalOpen(false);
      toast.success('Column Incepted');
    } catch (error) {
      toast.error('Orchestration failed');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    // Dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      const activeColId = active.data.current?.task.column_id;
      const overColId = over.data.current?.task.column_id;

      if (activeColId !== overColId) {
        const activeCol = board.find(c => c.id === activeColId);
        const overCol = board.find(c => c.id === overColId);
        if (!activeCol || !overCol) return;

        const activeIndex = activeCol.tasks.findIndex(t => t.id === activeId);
        const overIndex = overCol.tasks.findIndex(t => t.id === overId);

        const newBoard = board.map(col => {
          if (col.id === activeColId) {
            return { ...col, tasks: col.tasks.filter(t => t.id !== activeId) };
          }
          if (col.id === overColId) {
            const newTasks = [...col.tasks];
            newTasks.splice(overIndex, 0, active.data.current?.task);
            return { ...col, tasks: newTasks };
          }
          return col;
        });
        setBoard(newBoard);
      }
    }

    // Dropping a Task over a Column
    const isOverAColumn = over.data.current?.type === 'Column';
    if (isActiveATask && isOverAColumn) {
      const activeColId = active.data.current?.task.column_id;
      const overColId = overId;

      if (activeColId !== overColId) {
        const newBoard = board.map(col => {
          if (col.id === activeColId) {
            return { ...col, tasks: col.tasks.filter(t => t.id !== activeId) };
          }
          if (col.id === overColId) {
            return { ...col, tasks: [...col.tasks, active.data.current?.task] };
          }
          return col;
        });
        setBoard(newBoard);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Persist to Backend
    try {
      await api.post(`/kanban/${activeWorkspace?.id}/tasks/move`, {
        taskId: activeId,
        fromColumnId: active.data.current?.task.column_id,
        toColumnId: over.data.current?.task?.column_id || over.id,
        newPosition: 0 // Simplification for now
      });
    } catch (error) {
      console.error('Failed to persist move');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search and Filters */}
      <div className="px-4 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-accent-blue transition-smooth" />
          <input
            type="text"
            placeholder="Search sanctuary missions..."
            className="w-full bg-bg-secondary border border-border-color rounded-2xl pl-12 pr-6 py-3 md:py-4 text-sm focus:outline-none focus:border-accent-blue/50 transition-smooth"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 md:py-4 glass border border-border-color rounded-2xl text-sm font-bold text-text-dim hover:text-foreground hover:border-accent-blue/30 transition-smooth">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => setIsColumnModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-accent-blue text-foreground rounded-2xl text-sm font-bold shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/80 transition-smooth"
          >
            <Plus className="w-4 h-4" />
            Add Infrastructure
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 min-h-0 relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full flex overflow-x-auto pb-10 px-4 md:px-10 scrollbar-hide select-none custom-scrollbar">
            <div className="flex gap-6 h-full items-start">
              <SortableContext items={filteredBoard.map(col => col.id)} strategy={horizontalListSortingStrategy}>
                {filteredBoard.map(column => (
                  <KanbanColumn key={column.id} column={column} isViewer={false} />
                ))}
              </SortableContext>
            </div>
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: { opacity: '0.5' }
              }
            })
          }}>
            {activeColumn ? (
              <KanbanColumn column={activeColumn} isViewer={false} />
            ) : null}
            {activeTask ? (
              <KanbanTask task={activeTask} isOverlay={true} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* INCEPTION MODAL (FOR COLUMNS) */}
      <AnimatePresence>
        {isColumnModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsColumnModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card p-10 relative z-10"
            >
              <button
                onClick={() => setIsColumnModalOpen(false)}
                className="absolute top-6 right-6 text-text-dim hover:text-foreground"
                aria-label="Close Modal"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center">
                    <Layout className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">Incept Infrastructure</h2>
                    <p className="text-text-secondary text-sm">Orchestrate a new vertical for your technical flow.</p>
                  </div>
                </div>

                <form onSubmit={handleAddColumn} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest pl-1">Column Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Tactical Backlog"
                      className="w-full bg-bg-secondary border border-border-color rounded-xl px-4 py-4 text-foreground focus:border-accent-blue/50 outline-none transition-smooth"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-accent-blue hover:bg-accent-blue/80 text-foreground font-bold rounded-xl transition-smooth shadow-lg shadow-accent-blue/20"
                  >
                    Confirm Inception
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
