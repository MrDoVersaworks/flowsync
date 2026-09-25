import { and, eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { workspaceMembers, workspaces } from '../db/schema.js';
import { ErrorCode } from '../constants.js';

export const WORKSPACE_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;
export type WorkspaceRole = typeof WORKSPACE_ROLES[number];

export async function getWorkspaceAuthorization(userId: string, workspaceId: string) {
  const rows = await db
    .select({
      role: workspaceMembers.role,
      ownerId: workspaces.owner_id,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspace_id))
    .where(and(
      eq(workspaceMembers.user_id, userId),
      eq(workspaceMembers.workspace_id, workspaceId),
    ))
    .limit(1);

  if (rows.length === 0) {
    throw { status: 403, code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Not a member of this workspace' };
  }

  const role = rows[0].ownerId === userId ? 'owner' : rows[0].role as WorkspaceRole;
  return { role, ownerId: rows[0].ownerId };
}

export async function requireWorkspaceMember(userId: string, workspaceId: string) {
  const auth = await getWorkspaceAuthorization(userId, workspaceId);
  if (!['owner', 'admin', 'member', 'viewer'].includes(auth.role)) {
    throw { status: 403, code: ErrorCode.AUTH_FORBIDDEN, message: 'Workspace access denied' };
  }
  return auth;
}

export async function requireWorkspaceMutation(userId: string, workspaceId: string) {
  const auth = await getWorkspaceAuthorization(userId, workspaceId);
  if (!['owner', 'admin', 'member'].includes(auth.role)) {
    throw { status: 403, code: ErrorCode.AUTH_FORBIDDEN, message: 'Viewer role is read-only' };
  }
  return auth;
}

export async function requireWorkspaceAdmin(userId: string, workspaceId: string) {
  const auth = await getWorkspaceAuthorization(userId, workspaceId);
  if (!['owner', 'admin'].includes(auth.role)) {
    throw { status: 403, code: ErrorCode.AUTH_FORBIDDEN, message: 'Administrator role is required' };
  }
  return auth;
}

export async function requireWorkspaceOwner(userId: string, workspaceId: string) {
  const auth = await getWorkspaceAuthorization(userId, workspaceId);
  if (auth.ownerId !== userId || auth.role !== 'owner') {
    throw { status: 403, code: ErrorCode.AUTH_FORBIDDEN, message: 'Workspace owner role is required' };
  }
  return auth;
}
