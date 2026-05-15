import { eq, and, desc, sql } from 'drizzle-orm';
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
  // Check for duplicate names for this user
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

  // 1. Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspace_id))
    .where(eq(workspaceMembers.user_id, userId));
  
  const total = countResult[0]?.count || 0;

  // 2. Get paginated data
  const result = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      owner_id: workspaces.owner_id,
      invite_code: workspaces.invite_code,
      created_at: workspaces.created_at,
      unread_count: sql<number>`(
        SELECT count(*)::int 
        FROM ${taskComments} 
        INNER JOIN ${tasks} ON ${taskComments.task_id} = ${tasks.id}
        WHERE ${tasks.workspace_id} = ${workspaces.id}
        AND ${taskComments.user_id} != ${userId}
        AND ${taskComments.created_at} > COALESCE(
          (SELECT ${taskReads.last_read_at} FROM ${taskReads} WHERE ${taskReads.user_id} = ${userId} AND ${taskReads.task_id} = ${tasks.id}),
          '1970-01-01'::timestamp
        )
      )`
    })
    .from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspace_id))
    .where(eq(workspaceMembers.user_id, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(workspaces.created_at));

  return {
    data: result.map((ws): any => ({
      ...ws,
      created_at: ws.created_at.toISOString(),
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

  logger.info('DATABASE', `User ${userId} joined workspace: ${workspace.id} via code`);

  return toWorkspaceResponse(workspace);
}

export async function deleteWorkspace(userId: string, workspaceId: string, password?: string): Promise<void> {
  // 1. Verify User Password first
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'User not found' };
  }
  const user = userResult[0];

  if (!password) {
    throw { status: 400, code: ErrorCode.AUTH_INVALID_CREDENTIALS, message: 'Verification required. Please provide your password.' };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw { status: 401, code: ErrorCode.AUTH_INVALID_CREDENTIALS, message: 'Invalid verification credentials. Workspace purge aborted.' };
  }

  const wsResult = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  
  if (wsResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Workspace not found' };
  }

  const workspace = wsResult[0];

  if (workspace.owner_id !== userId) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Only the workspace owner can delete it' };
  }

  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  logger.info('DATABASE', `Workspace deleted: ${workspaceId} by owner: ${userId}`);
}

export async function updateMemberRole(
  userId: string, 
  workspaceId: string, 
  memberId: string, 
  role: 'admin' | 'member'
): Promise<void> {
  const wsResult = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (wsResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Workspace not found' };
  }

  if (wsResult[0].owner_id !== userId) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Only owners can reconfigure infrastructure roles.' };
  }

  if (memberId === userId) {
    throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: 'Owners cannot downgrade their own sovereignty.' };
  }

  await db.update(workspaceMembers)
    .set({ role })
    .where(and(eq(workspaceMembers.workspace_id, workspaceId), eq(workspaceMembers.user_id, memberId)));
    
  // Real-Time Broadcast for role synchronization
  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'MEMBER_UPDATED', workspaceId });

  logger.info('DATABASE', `Member ${memberId} role updated to ${role} in workspace ${workspaceId}`);
}

export async function removeMember(userId: string, workspaceId: string, memberId: string): Promise<void> {
  const wsResult = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (wsResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Workspace not found' };
  }

  if (wsResult[0].owner_id !== userId) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Only owners can purge members from the sanctuary.' };
  }

  if (memberId === userId) {
    throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: 'Owners cannot purge themselves. Use Workspace Purge instead.' };
  }

  await db.delete(workspaceMembers)
    .where(and(eq(workspaceMembers.workspace_id, workspaceId), eq(workspaceMembers.user_id, memberId)));

  // Real-Time Broadcast
  io.to(workspaceId).emit(SocketEvent.BOARD_UPDATED, { type: 'MEMBER_PURGED', workspaceId });

  logger.info('DATABASE', `Member ${memberId} purged from workspace ${workspaceId}`);
}

