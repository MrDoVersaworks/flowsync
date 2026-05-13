import { eq, and, asc, sql } from 'drizzle-orm';
import { db } from '../db/connection';
import { columns, tasks, workspaceMembers } from '../db/schema';
import { ErrorCode } from '../constants';
import { ColumnResponse, TaskResponse, KanbanBoardResponse, TaskMoveInput } from '../types/kanban.types';
import { logger } from '../utils/logger';

// Helper to verify workspace membership
async function verifyMembership(userId: string, workspaceId: string) {
  const membership = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.user_id, userId), eq(workspaceMembers.workspace_id, workspaceId)))
    .limit(1);

  if (membership.length === 0) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Not a member of this workspace' };
  }
}

export async function getBoard(userId: string, workspaceId: string): Promise<KanbanBoardResponse> {
  await verifyMembership(userId, workspaceId);

  const cols = await db
    .select()
    .from(columns)
    .where(eq(columns.workspace_id, workspaceId))
    .orderBy(asc(columns.position));

  const tks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.workspace_id, workspaceId))
    .orderBy(asc(tasks.position));

  const board: KanbanBoardResponse = {
    columns: cols.map(col => ({
      ...col,
      created_at: col.created_at.toISOString(),
      tasks: tks
        .filter(t => t.column_id === col.id)
        .map(t => ({
          ...t,
          created_at: t.created_at.toISOString(),
          updated_at: t.updated_at.toISOString(),
          due_date: t.due_date ? t.due_date.toISOString() : null,
        })),
    })),
  };

  return board;
}

export async function createColumn(userId: string, workspaceId: string, title: string): Promise<ColumnResponse> {
  await verifyMembership(userId, workspaceId);

  // Get max position
  const maxPosResult = await db
    .select({ max: sql<number>`max(${columns.position})::int` })
    .from(columns)
    .where(eq(columns.workspace_id, workspaceId));
  
  const nextPos = (maxPosResult[0]?.max ?? -1) + 1;

  const inserted = await db.insert(columns).values({
    workspace_id: workspaceId,
    title,
    position: nextPos,
  }).returning();

  const col = inserted[0];
  return { ...col, created_at: col.created_at.toISOString() };
}

export async function createTask(userId: string, workspaceId: string, columnId: string, title: string): Promise<TaskResponse> {
  await verifyMembership(userId, workspaceId);

  // Get max position in column
  const maxPosResult = await db
    .select({ max: sql<number>`max(${tasks.position})::int` })
    .from(tasks)
    .where(eq(tasks.column_id, columnId));
  
  const nextPos = (maxPosResult[0]?.max ?? -1) + 1;

  const inserted = await db.insert(tasks).values({
    workspace_id: workspaceId,
    column_id: columnId,
    title,
    position: nextPos,
    created_by: userId,
  }).returning();

  const task = inserted[0];
  return {
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
    due_date: task.due_date ? task.due_date.toISOString() : null,
  };
}

export async function moveTask(userId: string, workspaceId: string, input: TaskMoveInput): Promise<void> {
  await verifyMembership(userId, workspaceId);
  const { taskId, fromColumnId, toColumnId, newPosition } = input;

  // We use a transaction-like manual reordering logic
  // 1. If moving within same column, shift others
  // 2. If moving between columns, shift both
  
  if (fromColumnId === toColumnId) {
    // Same column reorder
    await db.transaction(async (tx) => {
      // Logic for same column shift (simplified for prototype, will be hardened in Phase 2)
      await tx.update(tasks)
        .set({ position: newPosition })
        .where(eq(tasks.id, taskId));
    });
  } else {
    // Cross column move
    await db.transaction(async (tx) => {
      await tx.update(tasks)
        .set({ column_id: toColumnId, position: newPosition })
        .where(eq(tasks.id, taskId));
    });
  }

  logger.info('DATABASE', `Task ${taskId} moved to column ${toColumnId} at pos ${newPosition}`);
}
