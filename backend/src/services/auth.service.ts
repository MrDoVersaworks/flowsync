import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users, refreshSessions } from '../db/schema.js';
import { SALT_ROUNDS, AUTH_ACCESS_TOKEN_EXPIRY, ErrorCode } from '../constants.js';
import { JWTPayload, AuthResponse, UserResponse } from '../types/auth.types.js';
import { config } from '../config/index.js';

const JWT_SECRET = config.jwtSecret;
const REFRESH_COOKIE = 'flowsync_refresh';
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateAccessToken(user: { id: string; email: string }): string {
  const payload: JWTPayload = { userId: user.id, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY });
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

async function issueRefreshSession(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await db.insert(refreshSessions).values({
    user_id: userId,
    token_hash: hashRefreshToken(rawToken),
    expires_at: expiresAt,
  });
  return rawToken;
}

export function getRefreshCookieName(): string {
  return REFRESH_COOKIE;
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: (config.nodeEnv === 'production' ? 'none' : 'lax') as const,
    path: '/api/auth',
    maxAge: REFRESH_TTL_MS,
  };
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse & { refreshToken: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existing.length > 0) {
    throw { status: 400, code: ErrorCode.AUTH_USER_EXISTS, message: 'User with this email already exists' };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const inserted = await db.insert(users).values({
    name: name.trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
  }).returning();

  if (inserted.length === 0) {
    throw { status: 500, code: ErrorCode.DB_ERROR, message: 'Failed to create user' };
  }

  const user = inserted[0];
  return { user: toUserResponse(user), accessToken: generateAccessToken(user), refreshToken: await issueRefreshSession(user.id) };
}

export async function loginUser(email: string, password: string): Promise<AuthResponse & { refreshToken: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

  if (existing.length === 0) {
    throw { status: 401, code: ErrorCode.AUTH_INVALID_CREDENTIALS, message: 'Invalid email or password' };
  }

  const user = existing[0];
  if (!(await bcrypt.compare(password, user.password_hash))) {
    throw { status: 401, code: ErrorCode.AUTH_INVALID_CREDENTIALS, message: 'Invalid email or password' };
  }

  return { user: toUserResponse(user), accessToken: generateAccessToken(user), refreshToken: await issueRefreshSession(user.id) };
}

export async function refreshAccessToken(rawToken: string): Promise<{ user: UserResponse; accessToken: string; refreshToken: string }> {
  const tokenHash = hashRefreshToken(rawToken);
  const now = new Date();

  const rotated = await db.transaction(async (tx) => {
    const [session] = await tx.update(refreshSessions)
      .set({ revoked_at: now })
      .where(and(
        eq(refreshSessions.token_hash, tokenHash),
        isNull(refreshSessions.revoked_at),
        gt(refreshSessions.expires_at, now),
      ))
      .returning();

    if (!session) return null;

    const userRows = await tx.select().from(users).where(eq(users.id, session.user_id)).limit(1);
    if (userRows.length === 0) return null;

    const nextRaw = crypto.randomBytes(48).toString('base64url');
    await tx.insert(refreshSessions).values({
      user_id: session.user_id,
      token_hash: hashRefreshToken(nextRaw),
      expires_at: new Date(Date.now() + REFRESH_TTL_MS),
    });

    return { user: userRows[0], refreshToken: nextRaw };
  });

  if (!rotated) {
    throw { status: 401, code: ErrorCode.AUTH_INVALID_TOKEN, message: 'Refresh session is invalid or expired' };
  }

  return {
    user: toUserResponse(rotated.user),
    accessToken: generateAccessToken(rotated.user),
    refreshToken: rotated.refreshToken,
  };
}

export async function revokeRefreshToken(rawToken?: string): Promise<void> {
  if (!rawToken) return;
  await db.update(refreshSessions).set({ revoked_at: new Date() })
    .where(eq(refreshSessions.token_hash, hashRefreshToken(rawToken)));
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    throw { status: 401, code: ErrorCode.AUTH_INVALID_TOKEN, message: 'Invalid or expired token' };
  }
}

export async function deleteUser(userId: string, password?: string): Promise<void> {
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'User not found' };
  }

  const user = userResult[0];
  if (!password || !(await bcrypt.compare(password, user.password_hash))) {
    throw { status: 401, code: ErrorCode.AUTH_INVALID_CREDENTIALS, message: 'Invalid password. Account deletion aborted.' };
  }

  await db.delete(users).where(eq(users.id, userId));
}
