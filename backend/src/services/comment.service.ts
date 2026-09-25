import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { taskComments, tasks, users, workspaceMembers, workspaces, taskReads } from '../db/schema.js';
import { ErrorCode, SocketEvent } from '../constants.js';
import { io } from '../index.js';
import { requireWorkspaceMember, requireWorkspaceAdmin } from './authorization.service.js';

export async function listTaskComments(userId: string, taskId: string) {
  const taskResult = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (taskResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Task not found' };
  }

  await requireWorkspaceMember(userId, taskResult[0].workspace_id);

  return db
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
}

export async function createComment(userId: string, taskId: string, content: string) {
  const taskResult = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (taskResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Task not found' };
  }

  await requireWorkspaceMember(userId, taskResult[0].workspace_id);

  const inserted = await db.insert(taskComments).values({
    task_id: taskId,
    user_id: userId,
    content,
  }).returning();

  await markTaskAsRead(userId, taskId);

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
  if (task.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Task not found' };
  }

  const workspace = await db.select().from(workspaces).where(eq(workspaces.id, task[0].workspace_id)).limit(1);
  if (workspace.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Workspace not found' };
  }

  const authorization = await requireWorkspaceMember(userId, task[0].workspace_id);
  if (comment[0].user_id !== userId && !['owner', 'admin'].includes(authorization.role)) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Only the author or workspace administrator can delete this comment.' };
  }

  await db.delete(taskComments).where(eq(taskComments.id, commentId));

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

  await requireWorkspaceAdmin(userId, task[0].workspace_id);
  await db.delete(taskComments).where(eq(taskComments.task_id, taskId));

  io.to(task[0].workspace_id).emit(SocketEvent.BOARD_UPDATED, {
    type: 'COMMENTS_PURGED',
    workspaceId: task[0].workspace_id,
    taskId
  });
}

export async function markTaskAsRead(userId: string, taskId: string) {
  const taskResult = await db
    .select({ workspaceId: tasks.workspace_id })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  if (taskResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Task not found' };
  }

  await requireWorkspaceMember(userId, taskResult[0].workspaceId);

  const now = new Date();
  await db.insert(taskReads).values({
    user_id: userId,
    task_id: taskId,
    last_read_at: now,
  }).onConflictDoUpdate({
    target: [taskReads.user_id, taskReads.task_id],
    set: { last_read_at: now }
  });
}
