import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { ErrorCode } from '../constants.js';
import { logger } from '../utils/logger.js';

export interface UserSettingsResponse {
  gemini_model_config: string | null;
  has_api_key: boolean;
}

export async function updateUserSettings(
  userId: string, 
  geminiKey?: string, 
  modelConfig?: string
): Promise<UserSettingsResponse> {
  const updateData: Partial<typeof users.$inferInsert> = { updated_at: new Date() };

  if (geminiKey) {
    const { iv, content, tag } = encrypt(geminiKey);
    updateData.encrypted_gemini_key = content;
    updateData.gemini_key_iv = iv;
    updateData.gemini_key_tag = tag;
    logger.info('AUTH', `API Key updated and encrypted for user: ${userId}`);
  }

  if (modelConfig) {
    updateData.gemini_model_config = modelConfig;
  }

  await db.update(users).set(updateData).where(eq(users.id, userId));

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return {
    gemini_model_config: user[0].gemini_model_config,
    has_api_key: !!user[0].encrypted_gemini_key,
  };
}

export async function getDecryptedApiKey(userId: string): Promise<string> {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (result.length === 0 || !result[0].encrypted_gemini_key) {
    throw { status: 400, code: ErrorCode.AI_SERVICE_ERROR, message: 'Gemini API key not configured. Please add it in settings.' };
  }

  const user = result[0];
  try {
    return decrypt(user.gemini_key_iv!, user.encrypted_gemini_key!, user.gemini_key_tag!);
  } catch (error) {
    logger.error('ERROR', `Failed to decrypt API key for user: ${userId}`, error);
    throw { status: 500, code: ErrorCode.INTERNAL_ERROR, message: 'Failed to retrieve API key securely.' };
  }
}
