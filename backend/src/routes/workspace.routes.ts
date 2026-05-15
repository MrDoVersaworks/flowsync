import { Response, Router } from 'express';
import { 
  createWorkspace, 
  listUserWorkspaces, 
  getWorkspaceDetail, 
  joinWorkspaceByCode,
  deleteWorkspace,
  updateMemberRole,
  removeMember
} from '../services/workspace.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/auth.types.js';
import { validate, createWorkspaceSchema, joinWorkspaceSchema } from '../middleware/validation.js';

const router = Router();

// Get all workspaces for current user (Paginated)
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  
  const result = await listUserWorkspaces(userId, page, limit);
  res.status(200).json({ success: true, ...result });
}));

// Create new workspace
router.post('/', validate(createWorkspaceSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { name } = req.body;
  const workspace = await createWorkspace(userId, name);
  res.status(201).json({ success: true, data: workspace });
}));

// Get workspace detail (members, tasks, etc)
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.id as string;
  const detail = await getWorkspaceDetail(userId, workspaceId);
  res.status(200).json({ success: true, data: detail });
}));

// Update member role
router.patch('/:id/members/:memberId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.id as string;
  const memberId = req.params.memberId as string;
  const { role } = req.body;
  await updateMemberRole(userId, workspaceId, memberId, role);
  res.status(200).json({ success: true, message: 'Role synchronized' });
}));

// Remove member
router.delete('/:id/members/:memberId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.id as string;
  const memberId = req.params.memberId as string;
  await removeMember(userId, workspaceId, memberId);
  res.status(200).json({ success: true, message: 'Member purged' });
}));

// Join workspace by invite code
router.post('/join', validate(joinWorkspaceSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { inviteCode } = req.body;
  const workspace = await joinWorkspaceByCode(userId, inviteCode);
  res.status(200).json({ success: true, data: workspace });
}));

// Delete workspace (owner only)
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.id as string;
  const { password } = req.body;
  await deleteWorkspace(userId, workspaceId, password);
  res.status(200).json({ success: true, message: 'Workspace deleted' });
}));

export default router;
