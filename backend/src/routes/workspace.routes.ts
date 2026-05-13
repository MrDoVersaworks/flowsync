import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { 
  createWorkspace, 
  listUserWorkspaces, 
  getWorkspaceDetail, 
  joinWorkspaceByCode 
} from '../services/workspace.service';

const router = Router();

// Validation Schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
});

const joinWorkspaceSchema = z.object({
  inviteCode: z.string().length(8),
});

// Protect all workspace routes
router.use(authMiddleware);

// GET /api/workspaces
router.get('/', asyncHandler(async (req: any, res: any) => {
  const result = await listUserWorkspaces(req.userId!);
  res.status(200).json({ success: true, data: result });
}));

// POST /api/workspaces
router.post('/', asyncHandler(async (req: any, res: any) => {
  const { name } = createWorkspaceSchema.parse(req.body);
  const result = await createWorkspace(req.userId!, name);
  res.status(201).json({ success: true, data: result });
}));

// GET /api/workspaces/:id
router.get('/:id', asyncHandler(async (req: any, res: any) => {
  const result = await getWorkspaceDetail(req.userId!, req.params.id);
  res.status(200).json({ success: true, data: result });
}));

// POST /api/workspaces/join
router.post('/join', asyncHandler(async (req: any, res: any) => {
  const { inviteCode } = joinWorkspaceSchema.parse(req.body);
  const result = await joinWorkspaceByCode(req.userId!, inviteCode);
  res.status(200).json({ success: true, data: result });
}));

export default router;
