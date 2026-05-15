import { eq, and, asc, sql, count } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { columns, tasks, workspaceMembers, taskComments, taskReads } from '../db/schema.js';
import { ErrorCode, SocketEvent } from '../constants.js';
import { ColumnResponse, TaskResponse, KanbanBoardResponse, TaskMoveInput } from '../types/kanban.types.js';
import { logger } from '../utils/logger.js';
import { io } from '../index.js';

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

  // Fetch tasks with comment counts
  const tks = await db
    .select({
      id: tasks.id,
      workspace_id: tasks.workspace_id,
      column_id: tasks.column_id,
      title: tasks.title,
      description: tasks.description,
      priority: tasks.priority,
      position: tasks.position,
      assigned_to: tasks.assigned_to,
      due_date: tasks.due_date,
      created_by: tasks.created_by,
      created_at: tasks.created_at,
      updated_at: tasks.updated_at,
      comment_count: sql<number>`(SELECT count(*)::int FROM ${taskComments} WHERE ${taskComments.task_id} = ${tasks.id})`,
      unread_count: sql<number>`(
        SELECT count(*)::int 
        FROM ${taskComments} 
        WHERE ${taskComments.task_id} = ${tasks.id} 
        AND ${taskComments.user_id} != ${userId}
        AND ${taskComments.created_at} > COALESCE(
          (SELECT ${taskReads.last_read_at} FROM ${taskReads} WHERE ${taskReads.user_id} = ${userId} AND ${taskReads.task_id} = ${tasks.id}),
          '1970-01-01'::timestamp
        )
      )`
    })
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
          comment_count: t.comment_count
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
  
  let nextPos = 0;
  const maxPos = maxPosResult[0]?.max;
  if (maxPos !== null && maxPos !== undefined) {
    nextPos = maxPos + 1;
  }

  const inserted = await db.insert(columns).values({
    workspace_id: workspaceId,
    title,
    position: nextPos,
  }).returning();

  const col = inserted[0];
  const response = { ...col, created_at: col.created_at.toISOString() };
  
  // Real-Time Broadcast
  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'COLUMN_CREATED', workspaceId });
  
  return response;
}

export async function createTask(userId: string, workspaceId: string, columnId: string, title: string): Promise<TaskResponse> {
  await verifyMembership(userId, workspaceId);

  // Get max position in column
  const maxPosResult = await db
    .select({ max: sql<number>`max(${tasks.position})::int` })
    .from(tasks)
    .where(eq(tasks.column_id, columnId));
  
  let nextPos = 0;
  const maxPos = maxPosResult[0]?.max;
  if (maxPos !== null && maxPos !== undefined) {
    nextPos = maxPos + 1;
  }

  const inserted = await db.insert(tasks).values({
    workspace_id: workspaceId,
    column_id: columnId,
    title,
    position: nextPos,
    created_by: userId,
  }).returning();

  const task = inserted[0];
  const response = {
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
    due_date: task.due_date ? task.due_date.toISOString() : null,
  };

  // Real-Time Broadcast
  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'TASK_CREATED', workspaceId });

  return response;
}

export async function updateTask(userId: string, workspaceId: string, taskId: string, data: any): Promise<TaskResponse> {
  await verifyMembership(userId, workspaceId);

  const updated = await db.update(tasks)
    .set({
      ...data,
      updated_at: new Date(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  if (updated.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Task not found' };
  }

  const task = updated[0];
  const response = {
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
    due_date: task.due_date ? task.due_date.toISOString() : null,
  };

  // Real-Time Broadcast
  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'TASK_UPDATED', workspaceId });

  return response;
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

  // Real-Time Broadcast
  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'TASK_MOVED', workspaceId });

  logger.info('DATABASE', `Task ${taskId} moved to column ${toColumnId} at pos ${newPosition}`);
}

export async function deleteTask(userId: string, workspaceId: string, taskId: string): Promise<void> {
  await verifyMembership(userId, workspaceId);

  const deleted = await db.delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspace_id, workspaceId)))
    .returning();

  if (deleted.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Task not found' };
  }

  // Real-Time Broadcast
  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'TASK_DELETED', workspaceId });
}

export async function deleteColumn(userId: string, workspaceId: string, columnId: string): Promise<void> {
  await verifyMembership(userId, workspaceId);

  // Cascading Delete: Tasks in the column are purged automatically by the DB if FK is set,
  // but we'll do it explicitly here for absolute certainty in this architecture.
  await db.transaction(async (tx) => {
    await tx.delete(tasks).where(and(eq(tasks.column_id, columnId), eq(tasks.workspace_id, workspaceId)));
    
    const deleted = await tx.delete(columns)
      .where(and(eq(columns.id, columnId), eq(columns.workspace_id, workspaceId)))
      .returning();

    if (deleted.length === 0) {
      throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Column not found' };
    }
  });

  // Real-Time Broadcast
  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'COLUMN_DELETED', workspaceId });
  
  logger.info('DATABASE', `Column ${columnId} purged from workspace ${workspaceId}`);
}
