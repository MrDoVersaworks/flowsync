import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { 
  SALT_ROUNDS, 
  AUTH_ACCESS_TOKEN_EXPIRY, 
  AUTH_REFRESH_TOKEN_EXPIRY, 
  ErrorCode 
} from '../constants.js';
import { JWTPayload, AuthResponse, UserResponse } from '../types/auth.types.js';

import { config } from '../config/index.js';

const JWT_SECRET = config.auth.jwtSecret;

function generateTokens(user: { id: string; email: string }): { accessToken: string; refreshToken: string } {
  const payload: JWTPayload = { userId: user.id, email: user.email };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY });
  
  return { accessToken, refreshToken };
}

function toUserResponse(user: typeof users.$inferSelect): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    gemini_model_config: user.gemini_model_config,
    created_at: user.created_at.toISOString(),
  };
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  // Check if user exists
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw { status: 400, code: ErrorCode.AUTH_USER_EXISTS, message: 'User with this email already exists' };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user
  const inserted = await db.insert(users).values({
    name,
    email,
    password_hash: passwordHash,
  }).returning();

  if (inserted.length === 0) {
    throw { status: 500, code: ErrorCode.DB_ERROR, message: 'Failed to create user' };
  }

  const user = inserted[0];
  const { accessToken, refreshToken } = generateTokens(user);

  return {
    user: toUserResponse(user),
    accessToken,
    refreshToken,
  };
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (existing.length === 0) {
    throw { status: 401, code: ErrorCode.AUTH_INVALID_CREDENTIALS, message: 'Invalid email or password' };
  }

  const user = existing[0];
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw { status: 401, code: ErrorCode.AUTH_INVALID_CREDENTIALS, message: 'Invalid email or password' };
  }

  const { accessToken, refreshToken } = generateTokens(user);

  return {
    user: toUserResponse(user),
    accessToken,
    refreshToken,
  };
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw { status: 401, code: ErrorCode.AUTH_INVALID_TOKEN, message: 'Invalid or expired token' };
  }
}
