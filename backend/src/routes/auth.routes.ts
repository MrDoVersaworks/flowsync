import { Request, Response, Router } from 'express';
import { registerUser, loginUser, deleteUser, refreshAccessToken, revokeRefreshToken, getRefreshCookieName, getRefreshCookieOptions } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/auth.types.js';
import { jwtBlocklist } from '../utils/blocklist.js';

const router = Router();

function setRefreshCookie(res: Response, token: string) {
  res.cookie(getRefreshCookieName(), token, getRefreshCookieOptions());
}

router.post('/register', validate(registerSchema), asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body.name, req.body.email, req.body.password);
  setRefreshCookie(res, result.refreshToken);
  res.status(201).json({ success: true, user: result.user, accessToken: result.accessToken });
}));

router.post('/login', validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body.email, req.body.password);
  setRefreshCookie(res, result.refreshToken);
  res.status(200).json({ success: true, user: result.user, accessToken: result.accessToken });
}));

router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[getRefreshCookieName()];
  const result = await refreshAccessToken(rawToken);
  setRefreshCookie(res, result.refreshToken);
  res.status(200).json({ success: true, user: result.user, accessToken: result.accessToken });
}));

router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  await revokeRefreshToken(req.cookies?.[getRefreshCookieName()]);
  res.clearCookie(getRefreshCookieName(), getRefreshCookieOptions());
  res.status(204).send();
}));

router.delete('/profile', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { password } = req.body;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      const signature = token.split('.')[2];
      if (signature) jwtBlocklist.add(signature);
    }
  }

  await deleteUser(userId, password);
  await revokeRefreshToken(req.cookies?.[getRefreshCookieName()]);
  res.clearCookie(getRefreshCookieName(), getRefreshCookieOptions());
  res.status(200).json({ success: true, message: 'Account purged successfully' });
}));

export default router;
