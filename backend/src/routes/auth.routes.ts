import { Request, Response, Router } from 'express';
import { registerUser, loginUser } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await registerUser(name, email, password);
  res.status(201).json({ success: true, ...result });
}));

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  res.status(200).json({ success: true, ...result });
}));

export default router;
