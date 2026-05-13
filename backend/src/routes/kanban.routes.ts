import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { getBoard, createColumn, createTask, moveTask } from '../services/kanban.service';

const router = Router();

// Validation Schemas
const createColumnSchema = z.object({
  title: z.string().min(1).max(100),
});

const createTaskSchema = z.object({
  columnId: z.string().uuid(),
  title: z.string().min(1).max(255),
});

const moveTaskSchema = z.object({
  taskId: z.string().uuid(),
  fromColumnId: z.string().uuid(),
  toColumnId: z.string().uuid(),
  newPosition: z.number().int().min(0),
});

// Protect all Kanban routes
router.use(authMiddleware);

// GET /api/kanban/:workspaceId
router.get('/:workspaceId', asyncHandler(async (req: any, res: any) => {
  const result = await getBoard(req.userId!, req.params.workspaceId);
  res.status(200).json({ success: true, data: result });
}));

// POST /api/kanban/:workspaceId/columns
router.post('/:workspaceId/columns', asyncHandler(async (req: any, res: any) => {
  const { title } = createColumnSchema.parse(req.body);
  const result = await createColumn(req.userId!, req.params.workspaceId, title);
  res.status(201).json({ success: true, data: result });
}));

// POST /api/kanban/:workspaceId/tasks
router.post('/:workspaceId/tasks', asyncHandler(async (req: any, res: any) => {
  const { columnId, title } = createTaskSchema.parse(req.body);
  const result = await createTask(req.userId!, req.params.workspaceId, columnId, title);
  res.status(201).json({ success: true, data: result });
}));

// POST /api/kanban/:workspaceId/move
router.post('/:workspaceId/move', asyncHandler(async (req: any, res: any) => {
  const validatedData = moveTaskSchema.parse(req.body);
  await moveTask(req.userId!, req.params.workspaceId, validatedData);
  res.status(200).json({ success: true, message: 'Task moved successfully' });
}));

export default router;
