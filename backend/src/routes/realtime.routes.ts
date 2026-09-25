import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/auth.types.js';
import { requireWorkspaceMember } from '../services/authorization.service.js';
import { authorizeWorkspaceChannel } from '../utils/pusher.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const authSchema = z.object({
  socket_id: z.string().min(1),
  channel_name: z.string().regex(/^private-workspace-[0-9a-f-]{36}$/i),
});

router.post('/auth', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = authSchema.parse(req.body);
    const workspaceId = parsed.channel_name.replace(/^private-workspace-/i, '');
    await requireWorkspaceMember(req.user!.userId, workspaceId);
    const auth = authorizeWorkspaceChannel(parsed.socket_id, parsed.channel_name, req.user!.userId, workspaceId);
    res.status(200).json(auth);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.issues[0]?.message || 'Invalid Pusher authorization request', 400));
      return;
    }
    next(error);
  }
});

export default router;
