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

export interface JWTPayload {
  userId: string;
  email: string;
}
