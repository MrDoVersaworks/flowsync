import { Response, Router } from 'express';
import { getBoard, createColumn, createTask, moveTask } from '../services/kanban.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/auth.types.js';

const router = Router();

// Get full board for a workspace
router.get('/:workspaceId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.workspaceId as string;
  const board = await getBoard(userId, workspaceId);
  res.status(200).json({ success: true, data: board });
}));

// Create column
router.post('/:workspaceId/columns', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.workspaceId as string;
  const { title } = req.body;
  const column = await createColumn(userId, workspaceId, title);
  res.status(201).json({ success: true, data: column });
}));

// Create task
router.post('/:workspaceId/tasks', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.workspaceId as string;
  const { columnId, title } = req.body;
  const task = await createTask(userId, workspaceId, columnId, title);
  res.status(201).json({ success: true, data: task });
}));

// Move task (cross-column or reorder)
router.post('/:workspaceId/move', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.workspaceId as string;
  const { taskId, fromColumnId, toColumnId, newPosition } = req.body;
  await moveTask(userId, workspaceId, { taskId, fromColumnId, toColumnId, newPosition });
  res.status(200).json({ success: true });
}));

export default router;
