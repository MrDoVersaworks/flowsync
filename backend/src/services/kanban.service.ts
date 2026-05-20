import { eq, and, asc, sql, count, lt, or, isNull, ne, max } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { columns, tasks, workspaceMembers, taskComments, taskReads } from '../db/schema.js';
import { ErrorCode, SocketEvent } from '../constants.js';
import { ColumnResponse, TaskResponse, KanbanBoardResponse, TaskMoveInput } from '../types/kanban.types.js';
import { logger } from '../utils/logger.js';
import { io } from '../index.js';

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

  // 1. Create a Type-Safe Subquery for Unread Counts (Using DSL only)
  const unreadCountsSubquery = db
    .select({
      taskId: taskComments.task_id,
      unread_count: count(taskComments.id).as('unread_count'),
    })
    .from(taskComments)
    .leftJoin(taskReads, and(
      eq(taskReads.task_id, taskComments.task_id),
      eq(taskReads.user_id, userId)
    ))
    .where(and(
      ne(taskComments.user_id, userId),
      or(
        isNull(taskReads.last_read_at),
        lt(taskReads.last_read_at, taskComments.created_at)
      )
    ))
    .groupBy(taskComments.task_id)
    .as('unread_counts_sq');

  // 2. Create a Subquery for total comment counts
  const totalCommentsSubquery = db
    .select({
      taskId: taskComments.task_id,
      total_count: count(taskComments.id).as('total_count'),
    })
    .from(taskComments)
    .groupBy(taskComments.task_id)
    .as('total_comments_sq');

  // 3. Main Query using Left Joins to the subqueries
  const tks = await db
    .select({
      id: tasks.id,
      workspace_id: tasks.workspace_id,
      column_id: tasks.column_id,
      title: tasks.title,
      description: tasks.description,
      priority: tasks.priority,
      position: tasks.position,
      created_by: tasks.created_by,
      created_at: tasks.created_at,
      updated_at: tasks.updated_at,
      unread_count: unreadCountsSubquery.unread_count,
      comment_count: totalCommentsSubquery.total_count,
    })
    .from(tasks)
    .leftJoin(unreadCountsSubquery, eq(tasks.id, unreadCountsSubquery.taskId))
    .leftJoin(totalCommentsSubquery, eq(tasks.id, totalCommentsSubquery.taskId))
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
          comment_count: Number(t.comment_count) || 0,
          unread_count: Number(t.unread_count) || 0
        })),
    })),
  };

  // DETAILED COLLABORATIVE AUDIT LOG
  const totalUnread = tks.reduce((acc, t) => acc + (Number(t.unread_count) || 0), 0);
  const tasksWithUnread = tks.filter(t => (Number(t.unread_count) || 0) > 0).map(t => `[${t.id.slice(0, 4)}: ${t.unread_count}]`).join(', ');
  
  logger.info('COLLABORATION', `Workspace ${workspaceId}: Board synchronized for user ${userId}. Total Unread Detected: ${totalUnread}. Alerts found in: ${tasksWithUnread || 'None'}`);

  return board;
}

export async function createColumn(userId: string, workspaceId: string, title: string): Promise<ColumnResponse> {
  await verifyMembership(userId, workspaceId);

  const maxPosResult = await db
    .select({ maxPos: max(columns.position) })
    .from(columns)
    .where(eq(columns.workspace_id, workspaceId));
  
  const nextPos = (maxPosResult[0]?.maxPos ?? -1) + 1;

  const inserted = await db.insert(columns).values({
    workspace_id: workspaceId,
    title,
    position: nextPos,
  }).returning();

  const col = inserted[0];
  const response = { ...col, created_at: col.created_at.toISOString() };
  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'COLUMN_CREATED', workspaceId });
  return response;
}

export async function createTask(userId: string, workspaceId: string, columnId: string, title: string, description?: string, priority?: string): Promise<TaskResponse> {
  await verifyMembership(userId, workspaceId);

  const maxPosResult = await db
    .select({ maxPos: max(tasks.position) })
    .from(tasks)
    .where(eq(tasks.column_id, columnId));
  
  const nextPos = (maxPosResult[0]?.maxPos ?? -1) + 1;

  const inserted = await db.insert(tasks).values({
    workspace_id: workspaceId,
    column_id: columnId,
    title,
    description,
    priority: priority || 'medium',
    position: nextPos,
    created_by: userId,
  }).returning();

  const task = inserted[0];
  const response = {
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
  };

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
    .where(and(eq(tasks.id, taskId), eq(tasks.workspace_id, workspaceId)))
    .returning();

  if (updated.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Task not found' };
  }

  const task = updated[0];
  const response = {
    ...task,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
  };

  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'TASK_UPDATED', workspaceId });
  return response;
}

export async function moveTask(userId: string, workspaceId: string, input: TaskMoveInput): Promise<void> {
  await verifyMembership(userId, workspaceId);
  const { taskId, fromColumnId, toColumnId, newPosition } = input;

  if (fromColumnId === toColumnId) {
    await db.transaction(async (tx) => {
      await tx.update(tasks)
        .set({ position: newPosition })
        .where(and(eq(tasks.id, taskId), eq(tasks.workspace_id, workspaceId)));
    });
  } else {
    await db.transaction(async (tx) => {
      await tx.update(tasks)
        .set({ column_id: toColumnId, position: newPosition })
        .where(and(eq(tasks.id, taskId), eq(tasks.workspace_id, workspaceId)));
    });
  }

  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'TASK_MOVED', workspaceId });
}

export async function deleteTask(userId: string, workspaceId: string, taskId: string): Promise<void> {
  await verifyMembership(userId, workspaceId);

  const deleted = await db.delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspace_id, workspaceId)))
    .returning();

  if (deleted.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Task not found' };
  }

  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'TASK_DELETED', workspaceId });
}

export async function deleteColumn(userId: string, workspaceId: string, columnId: string): Promise<void> {
  await verifyMembership(userId, workspaceId);

  await db.transaction(async (tx) => {
    await tx.delete(tasks).where(and(eq(tasks.column_id, columnId), eq(tasks.workspace_id, workspaceId)));
    await tx.delete(columns).where(and(eq(columns.id, columnId), eq(columns.workspace_id, workspaceId)));
  });

  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'COLUMN_DELETED', workspaceId });
}
