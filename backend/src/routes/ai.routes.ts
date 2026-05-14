import { Response, Router } from 'express';
import { breakdownGoal } from '../services/ai.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/auth.types.js';
import { validate, aiBreakdownSchema } from '../middleware/validation.js';

const router = Router();

// Breakdown a high-level goal into Kanban tasks
router.post('/breakdown', validate(aiBreakdownSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { workspaceId, goal, targetColumnId } = req.body;
  const tasks = await breakdownGoal(userId, workspaceId, goal, targetColumnId);
  
  if (req.timedout) return;
  res.status(200).json({ success: true, data: tasks });
}));

export default router;
