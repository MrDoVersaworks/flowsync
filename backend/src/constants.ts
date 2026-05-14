import { config } from './config/index.js';

// ============================================================
// SYSTEM CONSTANTS
// ============================================================
export const PORT = config.port;
export const NODE_ENV = config.nodeEnv;

// ============================================================
// SECURITY & AUTH
// ============================================================
export const AUTH_ACCESS_TOKEN_EXPIRY = '1h';
export const AUTH_REFRESH_TOKEN_EXPIRY = '7d';
export const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
export const SALT_ROUNDS = 12;

// ============================================================
// KANBAN LIMITS
// ============================================================
export const MAX_WORKSPACE_NAME_LENGTH = 50;
export const MAX_COLUMN_TITLE_LENGTH = 30;
export const MAX_TASK_TITLE_LENGTH = 255;
export const MAX_COLUMNS_PER_WORKSPACE = 10;
export const MAX_TASKS_PER_COLUMN = 100;

// ============================================================
// ERROR CODES
// ============================================================
export const ErrorCode = {
  // Auth
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_USER_EXISTS: 'AUTH_USER_EXISTS',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_NOT_FOUND: 'AUTH_NOT_FOUND',

  // Database
  DB_ERROR: 'DB_ERROR',
  DB_NOT_FOUND: 'DB_NOT_FOUND',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',

  // Business Logic
  WORKSPACE_LIMIT_REACHED: 'WORKSPACE_LIMIT_REACHED',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

// ============================================================
// AI DEFAULTS
// ============================================================
export const DEFAULT_AI_MODEL = 'gemini-1.5-flash';

// ============================================================
// SOCKET EVENTS
// ============================================================
export const SocketEvent = {
  JOIN_WORKSPACE: 'join_workspace',
  TASK_MOVED: 'task_moved',
  TASK_CREATED: 'task_created',
  COLUMN_CREATED: 'column_created',
};
