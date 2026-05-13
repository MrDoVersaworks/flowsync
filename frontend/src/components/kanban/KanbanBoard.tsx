'use client';

import { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import KanbanColumn from './KanbanColumn';
import KanbanTask from './KanbanTask';
import { socketService } from '@/lib/socket';

export default function KanbanBoard() {
  const { board, moveTaskOptimistically } = useWorkspaceStore();
  const [activeTask, setActiveTask] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Find the task data for the overlay
    const task = board.flatMap(col => col.tasks).find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Logic for cross-column move vs same-column move
    // This will be expanded in the next step to include the socket broadcast
    console.log(`Task ${taskId} dropped over ${overId}`);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 md:gap-6 h-full overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth">
        {board.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
        
        {/* New Column Placeholder */}
        <div className="flex-shrink-0 w-80 h-32 glass-panel border-dashed border-border-color/50 flex flex-col items-center justify-center gap-2 hover:border-accent-gold/50 transition-smooth cursor-pointer group snap-start">
          <Plus className="w-6 h-6 text-text-dim group-hover:text-accent-gold" />
          <span className="text-sm font-medium text-text-dim group-hover:text-white">Add Column</span>
        </div>
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: { active: { opacity: '0.5' } }
        })
      }}>
        {activeTask ? (
          <div className="w-[300px] cursor-grabbing rotate-3">
             <KanbanTask task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
