export interface ColumnResponse {
  id: string;
  workspace_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface TaskResponse {
  id: string;
  workspace_id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  priority: string;
  created_by: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface KanbanBoardResponse {
  columns: (ColumnResponse & { tasks: TaskResponse[] })[];
}

export interface TaskMoveInput {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  newPosition: number;
}
