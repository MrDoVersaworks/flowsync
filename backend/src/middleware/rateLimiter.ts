import { and, eq, lt, sql } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { ErrorCode } from '../constants.js';
import { db } from '../db/connection.js';
import { rateLimitBuckets } from '../db/schema.js';

export function persistentRateLimit(options: { name: string; windowMs: number; max: number }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const nowMs = Date.now();
    const windowStart = new Date(Math.floor(nowMs / options.windowMs) * options.windowMs);
    const key = `${options.name}:${req.ip || req.socket.remoteAddress || 'unknown'}`;

    try {
      const [bucket] = await db.insert(rateLimitBuckets)
        .values({ bucket_key: key, window_start: windowStart, count: 1 })
        .onConflictDoUpdate({
          target: [rateLimitBuckets.bucket_key, rateLimitBuckets.window_start],
          set: { count: sql`${rateLimitBuckets.count} + 1` },
        })
        .returning({ count: rateLimitBuckets.count });

      void db.delete(rateLimitBuckets).where(and(
        eq(rateLimitBuckets.bucket_key, key),
        lt(rateLimitBuckets.window_start, windowStart),
      ));

      if (Number(bucket.count) > options.max) {
        res.status(429).json({
          success: false,
          error: { code: ErrorCode.AUTH_UNAUTHORIZED, message: 'Rate limit exceeded. Please try again later.' },
        });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const authRateLimiter = persistentRateLimit({ name: 'auth', windowMs: 15 * 60 * 1000, max: 20 });
export const aiRateLimiter = persistentRateLimit({ name: 'ai', windowMs: 60 * 60 * 1000, max: 50 });
export const inviteRateLimiter = persistentRateLimit({ name: 'invite', windowMs: 15 * 60 * 1000, max: 20 });

export const generalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: { code: ErrorCode.INTERNAL_ERROR, message: 'Infrastructure load threshold reached. Please wait a moment.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
