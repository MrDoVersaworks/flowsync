import type { NextFunction, Response } from 'express';
import { config } from '../config/index.js';
import type { AuthRequest } from '../types/auth.types.js';

export function ownerMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authenticatedEmail = req.user?.email?.trim();
  const adminEmail = config.adminEmail?.trim();

  if (!authenticatedEmail) {
    res.status(401).json({
      success: false,
      error: {
        code: 'ERR_ADMIN_IDENTITY_MISSING',
        message: 'Authenticated owner identity is required.',
      },
    });
    return;
  }

  if (!adminEmail || authenticatedEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    res.status(403).json({
      success: false,
      error: {
        code: 'ERR_ADMIN_FORBIDDEN',
        message: 'Owner authorization is required.',
      },
    });
    return;
  }

  next();
}
