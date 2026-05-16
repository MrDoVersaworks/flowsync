import { eq, and, desc, sql, count, lt, or, isNull, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db/connection.js';
import { workspaces, workspaceMembers, users, tasks, taskComments, taskReads } from '../db/schema.js';
import { ErrorCode, SocketEvent } from '../constants.js';
import { io } from '../index.js';
import { 
  WorkspaceResponse, 
  WorkspaceDetailResponse, 
  WorkspaceMemberResponse,
  PaginatedWorkspaceResponse 
} from '../types/workspace.types.js';
import { logger } from '../utils/logger.js';

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function toWorkspaceResponse(ws: typeof workspaces.$inferSelect): WorkspaceResponse {
  return {
    id: ws.id,
    name: ws.name,
    owner_id: ws.owner_id,
    invite_code: ws.invite_code,
    created_at: ws.created_at.toISOString(),
  };
}

export async function createWorkspace(userId: string, name: string): Promise<WorkspaceResponse> {
  const existing = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.owner_id, userId), eq(workspaces.name, name)))
    .limit(1);

  if (existing.length > 0) {
    throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: 'A sanctuary with this name already exists in your infrastructure.' };
  }

  const inviteCode = generateInviteCode();

  const inserted = await db.insert(workspaces).values({
    name,
    owner_id: userId,
    invite_code: inviteCode,
  }).returning();

  if (inserted.length === 0) {
    throw { status: 500, code: ErrorCode.DB_ERROR, message: 'Failed to create workspace' };
  }

  const workspace = inserted[0];

  await db.insert(workspaceMembers).values({
    user_id: userId,
    workspace_id: workspace.id,
    role: 'admin',
  });

  logger.info('DATABASE', `Workspace created: ${workspace.id} by user: ${userId}`);

  return toWorkspaceResponse(workspace);
}

export async function listUserWorkspaces(
  userId: string, 
  page: number = 1, 
  limit: number = 20
): Promise<PaginatedWorkspaceResponse> {
  const offset = (page - 1) * limit;

  const countResult = await db
    .select({ totalCount: count() })
    .from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspace_id))
    .where(eq(workspaceMembers.user_id, userId));
  
  const total = countResult[0]?.totalCount || 0;

  const unreadCountsSubquery = db
    .select({
      workspaceId: tasks.workspace_id,
      unread_count: count(taskComments.id).as('unread_count'),
    })
    .from(taskComments)
    .innerJoin(tasks, eq(taskComments.task_id, tasks.id))
    .leftJoin(taskReads, and(
      eq(taskReads.task_id, tasks.id),
      eq(taskReads.user_id, userId)
    ))
    .where(and(
      ne(taskComments.user_id, userId),
      or(
        isNull(taskReads.last_read_at),
        lt(taskReads.last_read_at, taskComments.created_at)
      )
    ))
    .groupBy(tasks.workspace_id)
    .as('unread_counts_ws_sq');

  const result = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      owner_id: workspaces.owner_id,
      invite_code: workspaces.invite_code,
      created_at: workspaces.created_at,
      unread_count: unreadCountsSubquery.unread_count,
    })
    .from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspace_id))
    .leftJoin(unreadCountsSubquery, eq(workspaces.id, unreadCountsSubquery.workspaceId))
    .where(eq(workspaceMembers.user_id, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(workspaces.created_at));

  return {
    data: result.map((ws): any => ({
      ...ws,
      created_at: ws.created_at.toISOString(),
      unread_count: Number(ws.unread_count) || 0
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  };
}

export async function getWorkspaceDetail(userId: string, workspaceId: string): Promise<WorkspaceDetailResponse> {
  const membership = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.user_id, userId), eq(workspaceMembers.workspace_id, workspaceId)))
    .limit(1);

  if (membership.length === 0) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Not a member of this workspace' };
  }

  const wsResult = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (wsResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Workspace not found' };
  }

  const workspace = wsResult[0];

  const membersResult = await db
    .select({
      user_id: users.id,
      name: users.name,
      email: users.email,
      role: workspaceMembers.role,
      joined_at: workspaceMembers.joined_at,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.user_id, users.id))
    .where(eq(workspaceMembers.workspace_id, workspaceId));

  return {
    ...toWorkspaceResponse(workspace),
    members: membersResult.map((m): WorkspaceMemberResponse => ({
      ...m,
      role: m.role as 'admin' | 'member',
      joined_at: m.joined_at.toISOString(),
    })),
  };
}

export async function joinWorkspaceByCode(userId: string, inviteCode: string): Promise<WorkspaceResponse> {
  const wsResult = await db.select().from(workspaces).where(eq(workspaces.invite_code, inviteCode)).limit(1);
  if (wsResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Invalid invite code' };
  }
  const workspace = wsResult[0];

  const existing = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.user_id, userId), eq(workspaceMembers.workspace_id, workspace.id)))
    .limit(1);

  if (existing.length > 0) {
    return toWorkspaceResponse(workspace);
  }

  await db.insert(workspaceMembers).values({
    user_id: userId,
    workspace_id: workspace.id,
    role: 'member',
  });

  return toWorkspaceResponse(workspace);
}

export async function deleteWorkspace(userId: string, workspaceId: string, password?: string): Promise<void> {
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userResult[0];

  if (!password || !(await bcrypt.compare(password, user.password_hash))) {
    throw { status: 401, code: ErrorCode.AUTH_INVALID_CREDENTIALS, message: 'Invalid verification credentials.' };
  }

  const wsResult = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (wsResult[0].owner_id !== userId) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Only the workspace owner can delete it' };
  }

  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
}

export async function updateMemberRole(userId: string, workspaceId: string, memberId: string, role: 'admin' | 'member'): Promise<void> {
  const wsResult = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (wsResult[0].owner_id !== userId) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Only owners can reconfigure roles.' };
  }
  await db.update(workspaceMembers).set({ role }).where(and(eq(workspaceMembers.workspace_id, workspaceId), eq(workspaceMembers.user_id, memberId)));
  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'MEMBER_UPDATED', workspaceId });
}

export async function removeMember(userId: string, workspaceId: string, memberId: string): Promise<void> {
  const wsResult = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (wsResult[0].owner_id !== userId) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Only owners can purge members.' };
  }
  await db.delete(workspaceMembers).where(and(eq(workspaceMembers.workspace_id, workspaceId), eq(workspaceMembers.user_id, memberId)));
  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'MEMBER_PURGED', workspaceId });
}
