import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { taskComments, tasks, users, workspaceMembers, workspaces, taskReads } from '../db/schema.js';
import { ErrorCode, SocketEvent } from '../constants.js';
import { io } from '../index.js';

export async function listTaskComments(userId: string, taskId: string) {
  // Verify access via task's workspace
  const taskResult = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (taskResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Task not found' };
  }

  const membership = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.user_id, userId), eq(workspaceMembers.workspace_id, taskResult[0].workspace_id)))
    .limit(1);

  if (membership.length === 0) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Not a member of this workspace' };
  }

  const comments = await db
    .select({
      id: taskComments.id,
      content: taskComments.content,
      created_at: taskComments.created_at,
      user: {
        id: users.id,
        name: users.name,
      }
    })
    .from(taskComments)
    .innerJoin(users, eq(taskComments.user_id, users.id))
    .where(eq(taskComments.task_id, taskId))
    .orderBy(desc(taskComments.created_at));

  return comments;
}

export async function createComment(userId: string, taskId: string, content: string) {
  // Verify access
  const taskResult = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (taskResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Task not found' };
  }

  const membership = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.user_id, userId), eq(workspaceMembers.workspace_id, taskResult[0].workspace_id)))
    .limit(1);

  if (membership.length === 0) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Not a member of this workspace' };
  }

  const inserted = await db.insert(taskComments).values({
    task_id: taskId,
    user_id: userId,
    content,
  }).returning();

  // Real-Time Broadcast for unread counts
  io.to(taskResult[0].workspace_id).emit(SocketEvent.BOARD_UPDATED, { 
    type: 'COMMENT_ADDED', 
    workspaceId: taskResult[0].workspace_id,
    taskId 
  });

  return inserted[0];
}

export async function deleteComment(userId: string, commentId: string) {
  const comment = await db.select().from(taskComments).where(eq(taskComments.id, commentId)).limit(1);
  if (comment.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Comment not found' };
  }

  const task = await db.select().from(tasks).where(eq(tasks.id, comment[0].task_id)).limit(1);
  const workspace = await db.select().from(workspaces).where(eq(workspaces.id, task[0].workspace_id)).limit(1);

  // Author or Workspace Owner can delete
  if (comment[0].user_id !== userId && workspace[0].owner_id !== userId) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Only the author or sanctuary owner can purge this note.' };
  }

  await db.delete(taskComments).where(eq(taskComments.id, commentId));

  // Real-Time Broadcast
  io.to(task[0].workspace_id).emit(SocketEvent.BOARD_UPDATED, { 
    type: 'COMMENT_DELETED', 
    workspaceId: task[0].workspace_id,
    taskId: task[0].id 
  });
}

export async function purgeTaskComments(userId: string, taskId: string) {
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (task.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Task not found' };
  }

  const workspace = await db.select().from(workspaces).where(eq(workspaces.id, task[0].workspace_id)).limit(1);

  // Only Workspace Owner can purge entire feed
  if (workspace[0].owner_id !== userId) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Only the sanctuary owner can wipe the technical reconciliation feed.' };
  }

  await db.delete(taskComments).where(eq(taskComments.task_id, taskId));

  // Real-Time Broadcast
  io.to(task[0].workspace_id).emit(SocketEvent.BOARD_UPDATED, { 
    type: 'COMMENTS_PURGED', 
    workspaceId: task[0].workspace_id,
    taskId 
  });
}
export async function markTaskAsRead(userId: string, taskId: string) {
  await db.insert(taskReads).values({
    user_id: userId,
    task_id: taskId,
    last_read_at: new Date(),
  }).onConflictDoUpdate({
    target: [taskReads.user_id, taskReads.task_id],
    set: { last_read_at: new Date() }
  });
}
