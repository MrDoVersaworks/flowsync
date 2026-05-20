import { create } from 'zustand';

export interface WorkspaceMember {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  joined_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string;
  members?: WorkspaceMember[];
}

export interface Task {
  id: string;
  workspace_id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  created_at: string;
  updated_at: string;
  comment_count?: number;
  unread_count?: number;
}

export interface Column {
  id: string;
  workspace_id: string;
  title: string;
  position: number;
  tasks: Task[];
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  board: Column[];
  isLoading: boolean;

  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setBoard: (board: Column[]) => void;
  setLoading: (isLoading: boolean) => void;
  
  // Real-time optimistic updates
  moveTaskOptimistically: (taskId: string, toColumnId: string, newPosition: number) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  board: [],
  isLoading: false,

  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  setBoard: (board) => set({ board }),
  setLoading: (isLoading) => set({ isLoading }),

  moveTaskOptimistically: (taskId, toColumnId, newPosition) => 
    set((state) => {
      // Create a deep copy of the board
      const newBoard = JSON.parse(JSON.stringify(state.board)) as Column[];
      
      let taskToMove: Task | null = null;
      let fromColumn: Column | null = null;

      // Find the task and remove it from source
      for (const col of newBoard) {
        const index = col.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          taskToMove = col.tasks.splice(index, 1)[0];
          fromColumn = col;
          break;
        }
      }

      if (!taskToMove) return state;

      // Find target column and insert
      const targetCol = newBoard.find(c => c.id === toColumnId);
      if (targetCol) {
        taskToMove.column_id = toColumnId;
        targetCol.tasks.splice(newPosition, 0, taskToMove);
        
        // Re-calculate positions for target column
        targetCol.tasks.forEach((t, i) => t.position = i);
      }

      return { board: newBoard };
    }),
}));
