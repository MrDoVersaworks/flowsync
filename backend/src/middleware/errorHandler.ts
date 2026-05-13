import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ErrorCode } from '../constants';

// Centralized Async Wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global Error Handler
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('ERROR', `${req.method} ${req.url} - ${statusCode} - ${message}`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || ErrorCode.INTERNAL_ERROR,
      message: message,
    },
  });
};
