import { Response, Router } from 'express';
import { breakdownGoal } from '../services/ai.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/auth.types.js';

const router = Router();

// Breakdown a high-level goal into Kanban tasks
router.post('/breakdown', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { goal } = req.body;
  const tasks = await breakdownGoal(userId, goal);
  res.status(200).json({ success: true, data: tasks });
}));

export default router;
