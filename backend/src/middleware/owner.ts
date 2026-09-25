import type { Response } from 'express';
import { config } from '../config/index.js';
import type { AuthRequest } from '../types/auth.types.js';

export function ownerMiddleware(req: AuthRequest, res: Response, next: () => void): void {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: { code: 'ERR_ADMIN_IDENTITY_MISSING', message: 'Authenticated administrator identity is required.' },
    });
    return;
  }

  if (!config.adminUserId || userId !== config.adminUserId) {
    res.status(403).json({
      success: false,
      error: { code: 'ERR_ADMIN_FORBIDDEN', message: 'Administrator authorization is required.' },
    });
    return;
  }

  next();
}
