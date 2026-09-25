import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from '../utils/logger.js';
import { ErrorCode } from '../constants.js';

export class AppError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err: Error & { status?: number; code?: string }, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || 500;
  const correlationId = randomUUID();
  const safeMessage = statusCode >= 500 ? 'Internal server error. Contact support with the correlation ID.' : (err.message || 'Request failed');

  logger.error('ERROR', `${req.method} ${req.url} - ${statusCode} - correlation=${correlationId}`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || ErrorCode.INTERNAL_ERROR,
      message: safeMessage,
      correlationId,
    },
  });
};
