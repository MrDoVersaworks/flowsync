import { Response, Router } from 'express';
import { listTaskComments, createComment, deleteComment, purgeTaskComments, markTaskAsRead } from '../services/comment.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/auth.types.js';
import { validateParams, taskIdParamSchema, commentIdParamSchema } from '../middleware/validation.js';

const router = Router();

// List comments for a task
router.get('/:taskId', validateParams(taskIdParamSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const taskId = req.params.taskId as string;
  const comments = await listTaskComments(userId, taskId);
  res.status(200).json({ success: true, data: comments });
}));

// Add a comment to a task
router.post('/:taskId', validateParams(taskIdParamSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const taskId = req.params.taskId as string;
  const { content } = req.body;
  const comment = await createComment(userId, taskId, content);
  res.status(201).json({ success: true, data: comment });
}));

// Delete a single comment
router.delete('/:commentId', validateParams(commentIdParamSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const commentId = req.params.commentId as string;
  await deleteComment(userId, commentId);
  res.status(200).json({ success: true, message: 'Note purged' });
}));

// Purge all comments for a task
router.delete('/task/:taskId', validateParams(taskIdParamSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const taskId = req.params.taskId as string;
  await purgeTaskComments(userId, taskId);
  res.status(200).json({ success: true, message: 'Feed wiped' });
}));

// Mark task as read
router.post('/read/:taskId', validateParams(taskIdParamSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const taskId = req.params.taskId as string;
  await markTaskAsRead(userId, taskId);
  res.status(200).json({ success: true, message: 'Task marked as read' });
}));

export default router;

