import { Response, Router } from 'express';
import { updateUserSettings, getUserSettings, clearUserApiKey, clearUserModel } from '../services/settings.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/auth.types.js';
import { validate, updateSettingsSchema } from '../middleware/validation.js';

const router = Router();

// Get current user AI settings
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const settings = await getUserSettings(userId);
  res.status(200).json({ success: true, data: settings });
}));

// Update settings (AI key, model choice, etc)
router.post('/', validate(updateSettingsSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { geminiKey, modelConfig } = req.body;
  const result = await updateUserSettings(userId, geminiKey, modelConfig);
  res.status(200).json({ success: true, data: result });
}));

// Reset API Key
router.delete('/key', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  await clearUserApiKey(userId);
  res.status(200).json({ success: true, message: 'API Key purged.' });
}));

// Reset Model Configuration
router.delete('/model', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  await clearUserModel(userId);
  res.status(200).json({ success: true, message: 'Model configuration reset to default.' });
}));

export default router;
