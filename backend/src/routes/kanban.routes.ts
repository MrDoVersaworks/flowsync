import { Response, Router } from 'express';
import { z } from 'zod';
import { getBoard, createColumn, createTask, updateTask, moveTask, deleteTask, deleteColumn } from '../services/kanban.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/auth.types.js';
import { 
  validate, 
  createColumnSchema, 
  createTaskSchema, 
  updateTaskSchema,
  moveTaskSchema, validateParams, workspaceIdParamSchema 
} from '../middleware/validation.js';

const router = Router();

// Get full board for a workspace
router.get('/:workspaceId', validateParams(workspaceIdParamSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.workspaceId as string;
  const board = await getBoard(userId, workspaceId);
  res.status(200).json({ success: true, data: board });
}));

// Create column
router.post('/:workspaceId/columns', validateParams(workspaceIdParamSchema), validate(createColumnSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.workspaceId as string;
  const { title } = req.body;
  const column = await createColumn(userId, workspaceId, title);
  res.status(201).json({ success: true, data: column });
}));

// Create task
router.post('/:workspaceId/tasks', validateParams(workspaceIdParamSchema), validate(createTaskSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.workspaceId as string;
  const { columnId, title, description, priority } = req.body;
  const task = await createTask(userId, workspaceId, columnId, title, description, priority);
  res.status(201).json({ success: true, data: task });
}));

// Move task (cross-column or reorder)
router.post('/:workspaceId/move', validateParams(workspaceIdParamSchema), validate(moveTaskSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.workspaceId as string;
  const { taskId, fromColumnId, toColumnId, newPosition } = req.body;
  await moveTask(userId, workspaceId, { taskId, fromColumnId, toColumnId, newPosition });
  res.status(200).json({ success: true });
}));

// Update task
router.patch('/:workspaceId/tasks/:taskId', validateParams(z.object({ workspaceId: z.string().uuid(), taskId: z.string().uuid() })), validate(updateTaskSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.workspaceId as string;
  const taskId = req.params.taskId as string;
  const task = await updateTask(userId, workspaceId, taskId, req.body);
  res.status(200).json({ success: true, data: task });
}));

// Delete task
router.delete('/:workspaceId/tasks/:taskId', validateParams(z.object({ workspaceId: z.string().uuid(), taskId: z.string().uuid() })), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.workspaceId as string;
  const taskId = req.params.taskId as string;
  await deleteTask(userId, workspaceId, taskId);
  res.status(200).json({ success: true });
}));

// Delete column
router.delete('/:workspaceId/columns/:columnId', validateParams(z.object({ workspaceId: z.string().uuid(), columnId: z.string().uuid() })), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const workspaceId = req.params.workspaceId as string;
  const columnId = req.params.columnId as string;
  await deleteColumn(userId, workspaceId, columnId);
  res.status(200).json({ success: true });
}));

export default router;
