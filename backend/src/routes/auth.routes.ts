import { Request, Response, Router } from 'express';
import { registerUser, loginUser, deleteUser } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/auth.types.js';
import { jwtBlocklist } from '../utils/blocklist.js';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await registerUser(name, email, password);
  res.status(201).json({ success: true, ...result });
}));

router.post('/login', validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  res.status(200).json({ success: true, ...result });
}));

router.delete('/profile', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { password } = req.body;

  // Blocklist the current access token immediately
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      const signature = token.split('.')[2];
      if (signature) {
        jwtBlocklist.add(signature);
      }
    }
  }

  await deleteUser(userId, password);
  res.status(200).json({ success: true, message: 'Account purged successfully' });
}));

export default router;
