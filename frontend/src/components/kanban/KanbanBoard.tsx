'use client';

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
import { 
  arrayMove, 
  SortableContext, 
  horizontalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import { useWorkspaceStore, Task, Column } from '@/store/useWorkspaceStore';
import KanbanColumn from './KanbanColumn';
import KanbanTask from './KanbanTask';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';

interface Props {
  isViewer?: boolean;
}

export default function KanbanBoard({ isViewer }: Props) {
  const { board } = useWorkspaceStore();
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredBoard = activeFilter === 'all' 
    ? board 
    : board.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => (Number(t.unread_count) || 0) > 0)
      })).filter(col => col.tasks.length > 0);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Reconciliation Filter Bar (Global for all roles) */}
      <div className="flex items-center gap-4 px-4 md:px-0">
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-smooth border ${
            activeFilter === 'all' 
              ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20' 
              : 'bg-bg-secondary text-text-dim border-border-color hover:border-accent-blue/50'
          }`}
        >
          All Technical Contexts
        </button>
        <button 
          onClick={() => setActiveFilter('unread')}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-smooth border flex items-center gap-2 ${
            activeFilter === 'unread' 
              ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' 
              : 'bg-bg-secondary text-text-dim border-border-color hover:border-red-500/50'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full bg-red-500 ${activeFilter === 'unread' ? 'animate-ping' : ''}`} />
          Unread Intelligence
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {isViewer ? (
          <div className="flex justify-start gap-6 md:gap-10 h-full overflow-x-auto pb-10 px-4 md:px-0 custom-scrollbar">
            {filteredBoard.map((column) => (
              <KanbanColumn key={column.id} column={column} isViewer={true} />
            ))}
          </div>
        ) : (
          <InteractiveBoard filteredBoard={filteredBoard} />
        )}
      </div>
    </div>
  );
}

function InteractiveBoard({ filteredBoard }: { filteredBoard: Column[] }) {
  const { id: workspaceId } = useParams();
  const { board, setBoard } = useWorkspaceStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = board
      .flatMap((col) => col.tasks)
      .find((t) => t.id === active.id);
    
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = board.find((col) => col.tasks.some((t) => t.id === activeId));
    const overColumn = board.find((col) => col.id === overId || col.tasks.some((t) => t.id === overId));

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setBoard(
      board.map((col) => {
        if (col.id === activeColumn.id) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) };
        }
        if (col.id === overColumn.id) {
          const activeTask = activeColumn.tasks.find((t) => t.id === activeId)!;
          const overIndex = col.tasks.findIndex((t) => t.id === overId);
          const newIndex = overIndex >= 0 ? overIndex : col.tasks.length;
          
          const newTasks = [...col.tasks];
          newTasks.splice(newIndex, 0, activeTask);
          return { ...col, tasks: newTasks };
        }
        return col;
      })
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = board.find((col) => col.tasks.some((t) => t.id === activeId));
    const overColumn = board.find((col) => col.id === overId || col.tasks.some((t) => t.id === overId));

    if (!activeColumn || !overColumn) return;

    const activeTask = activeColumn.tasks.find((t) => t.id === activeId)!;
    const oldIndex = activeColumn.tasks.indexOf(activeTask);
    const newIndex = overColumn.tasks.findIndex((t) => t.id === overId);

    // If same column, just reorder
    if (activeColumn.id === overColumn.id) {
      if (oldIndex !== newIndex) {
        setBoard(
          board.map((col) => {
            if (col.id === activeColumn.id) {
              return { ...col, tasks: arrayMove(col.tasks, oldIndex, newIndex) };
            }
            return col;
          })
        );
      }
    }

    // Persist to backend
    try {
      await api.post(`/kanban/${workspaceId}/move`, {
        taskId: activeId,
        fromColumnId: activeColumn.id,
        toColumnId: overColumn.id,
        newPosition: newIndex >= 0 ? newIndex : 0,
      });
    } catch (error) {
      console.error('Failed to persist move');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-start gap-6 md:gap-10 h-full overflow-x-auto pb-10 px-4 md:px-0 custom-scrollbar">
        <SortableContext items={filteredBoard.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
          {filteredBoard.map((column) => (
            <KanbanColumn key={column.id} column={column} isViewer={false} />
          ))}
        </SortableContext>
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeTask ? (
          <div className="w-[85vw] sm:w-80 md:w-96 max-w-[380px] cursor-grabbing">
            <KanbanTask task={activeTask} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
