import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { breakdownGoal } from '../services/ai.service';
import { createTask } from '../services/kanban.service';
import { logger } from '../utils/logger';

const router = Router();

// Validation Schemas
const breakdownSchema = z.object({
  workspaceId: z.string().uuid(),
  columnId: z.string().uuid(),
  goal: z.string().min(5).max(500),
});

// Protect all AI routes
router.use(authMiddleware);

// POST /api/ai/breakdown
router.post('/breakdown', asyncHandler(async (req: any, res: any) => {
  const { workspaceId, columnId, goal } = breakdownSchema.parse(req.body);
  
  // 1. Get AI recommendations
  const subTasks = await breakdownGoal(req.userId!, goal);

  // 2. Create tasks in DB (Sequence)
  const createdTasks = [];
  for (const subTask of subTasks) {
    const task = await createTask(
      req.userId!, 
      workspaceId, 
      columnId, 
      subTask.title
    );
    // Note: In a full production system, we'd update description/priority here too
    createdTasks.push(task);
  }

  logger.info('AI', `Automated creation of ${createdTasks.length} tasks completed for workspace: ${workspaceId}`);

  res.status(201).json({
    success: true,
    data: createdTasks,
    message: `AI successfully generated ${createdTasks.length} tasks.`,
  });
}));

export default router;
