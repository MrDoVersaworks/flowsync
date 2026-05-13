import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { updateUserSettings, UserSettingsResponse } from '../services/settings.service';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Validation Schemas
const updateSettingsSchema = z.object({
  geminiKey: z.string().min(10).optional(),
  modelConfig: z.string().min(1).max(100).optional(),
});

// Protect all settings routes
router.use(authMiddleware);

// GET /api/settings
router.get('/', asyncHandler(async (req: any, res: any) => {
  const result = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
  const user = result[0];
  
  const response: UserSettingsResponse = {
    gemini_model_config: user.gemini_model_config,
    has_api_key: !!user.encrypted_gemini_key,
  };

  res.status(200).json({ success: true, data: response });
}));

// POST /api/settings
router.post('/', asyncHandler(async (req: any, res: any) => {
  const validatedData = updateSettingsSchema.parse(req.body);
  const result = await updateUserSettings(req.userId!, validatedData.geminiKey, validatedData.modelConfig);
  
  res.status(200).json({ success: true, data: result });
}));

export default router;
