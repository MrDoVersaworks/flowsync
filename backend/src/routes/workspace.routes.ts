import { Response, Router } from 'express';
import { 
  createWorkspace, 
  listUserWorkspaces, 
  getWorkspaceDetail, 
  joinWorkspaceByCode 
} from '../services/workspace.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/auth.types.js';

const router = Router();

// Get all workspaces for current user
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaces = await listUserWorkspaces(userId);
  res.status(200).json({ success: true, data: workspaces });
}));

// Create new workspace
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
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

// Join workspace by invite code
router.post('/join', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { inviteCode } = req.body;
  const workspace = await joinWorkspaceByCode(userId, inviteCode);
  res.status(200).json({ success: true, data: workspace });
}));

export default router;
