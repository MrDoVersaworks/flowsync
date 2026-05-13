import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
import { registerUser, loginUser } from '../services/auth.service';

const router = Router();

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post('/register', asyncHandler(async (req: any, res: any) => {
  const validatedData = registerSchema.parse(req.body);
  const result = await registerUser(validatedData.name, validatedData.email, validatedData.password);
  
  res.status(201).json({
    success: true,
    data: result,
  });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req: any, res: any) => {
  const validatedData = loginSchema.parse(req.body);
  const result = await loginUser(validatedData.email, validatedData.password);
  
  res.status(200).json({
    success: true,
    data: result,
  });
}));

export default router;
