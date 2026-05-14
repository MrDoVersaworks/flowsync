import rateLimit from 'express-rate-limit';
import { ErrorCode } from '../constants.js';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window for auth (Login/Register)
  message: {
    success: false,
    error: {
      code: ErrorCode.AUTH_UNAUTHORIZED,
      message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 AI orchestration requests per hour
  message: {
    success: false,
    error: {
      code: ErrorCode.AI_SERVICE_ERROR,
      message: 'Sovereign AI quota exceeded for this hour. Orchestration will resume shortly.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute for general API usage
  message: {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Infrastructure load threshold reached. Please wait a moment.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
