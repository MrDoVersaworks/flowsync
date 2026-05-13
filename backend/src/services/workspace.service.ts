import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { workspaces, workspaceMembers, users } from '../db/schema.js';
import { ErrorCode } from '../constants.js';
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
    })
    .from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspace_id))
    .where(eq(workspaceMembers.user_id, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(workspaces.created_at));

  return {
    data: result.map((ws): WorkspaceResponse => ({
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
