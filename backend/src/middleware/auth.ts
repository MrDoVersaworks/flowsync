import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service.js';
import { ErrorCode } from '../constants.js';
import { AuthRequest } from '../types/auth.types.js';

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Authentication required' },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: ErrorCode.AUTH_INVALID_TOKEN, message: 'Invalid or expired token' },
    });
  }
};
