import crypto from 'crypto';
import { config } from '../config/index.js';
import { ENCRYPTION_ALGORITHM } from '../constants.js';

const KEY_BUFFER = Buffer.from(config.security.aesKey, 'hex');

if (KEY_BUFFER.length !== 32) {
  throw new Error('[ERR_INVALID_KEY] AES_KEY must be exactly 32 bytes (64 hex characters) for AES-256-GCM.');
}

export function encrypt(text: string): { iv: string; content: string; tag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, KEY_BUFFER, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag().toString('hex');
  
  return {
    iv: iv.toString('hex'),
    content: encrypted,
    tag: tag,
  };
}

export function decrypt(iv: string, content: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    KEY_BUFFER,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
