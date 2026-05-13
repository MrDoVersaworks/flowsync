import { Response, Router } from 'express';
import { updateUserSettings } from '../services/settings.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/auth.types.js';
import { validate, updateSettingsSchema } from '../middleware/validation.js';

const router = Router();

// Get current user AI settings
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  res.status(200).json({ success: true, data: { userId } });
}));

// Update settings (AI key, model choice, etc)
router.post('/', validate(updateSettingsSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { geminiKey, modelConfig } = req.body;
  const result = await updateUserSettings(userId, geminiKey, modelConfig);
  res.status(200).json({ success: true, data: result });
}));

export default router;
