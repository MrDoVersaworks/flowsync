import { Request } from 'express';

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  gemini_model_config: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}
