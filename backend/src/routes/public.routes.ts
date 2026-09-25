import { Router, Request, Response, NextFunction } from 'express';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { systemSettings, platformReviews } from '../db/schema.js';
import { z } from 'zod';

const router = Router();

router.get('/settings', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settingsArray = await db.select().from(systemSettings).limit(1);
    const settings = settingsArray[0] || { google_analytics_id: '', termly_uuid: '' };
    res.status(200).json({ success: true, data: settings });
  } catch (error) { next(error); }
});

router.get('/reviews', async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await db.select({
      id: platformReviews.id,
      name: platformReviews.name,
      profession: platformReviews.profession,
      rating: platformReviews.rating,
      feedback: platformReviews.feedback,
      createdAt: platformReviews.created_at,
    }).from(platformReviews)
      .where(eq(platformReviews.approved, true))
      .orderBy(desc(platformReviews.created_at));
    res.status(200).json({ success: true, data: reviews });
  } catch {
    res.status(200).json({ success: true, data: [] });
  }
});

const reviewSchema = z.object({
  name: z.string().min(2).max(100),
  profession: z.string().max(100).optional(),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().min(10).max(1000),
});

router.post('/reviews', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = reviewSchema.parse(req.body);
    const [inserted] = await db.insert(platformReviews).values({
      name: parsed.name.trim(),
      profession: parsed.profession?.trim() || null,
      rating: parsed.rating,
      feedback: parsed.feedback.trim(),
      approved: false,
    }).returning();
    res.status(201).json({ success: true, data: { id: inserted.id, status: 'pending' } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message || 'Invalid review' } });
      return;
    }
    next(error);
  }
});

export default router;
