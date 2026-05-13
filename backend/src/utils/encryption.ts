import crypto from 'crypto';
import dotenv from 'dotenv';
import { ENCRYPTION_ALGORITHM } from '../constants';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 characters
const ALGORITHM = ENCRYPTION_ALGORITHM;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
}

export function encrypt(text: string): { iv: string; content: string; tag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!), iv);
  
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
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY!),
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
