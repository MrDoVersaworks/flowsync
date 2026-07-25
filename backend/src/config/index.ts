import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  AES_KEY: z.string().min(1, 'AES_KEY is required'),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_ORIGIN: z.string().optional(),
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

function validateConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missingVars = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
    );
    const errorMessage = [
      '[ERR_CONFIG_VALIDATION] FlowSync Infrastructure refused to start. Missing or invalid environment variables:',
      ...missingVars,
      '',
      'Check your .env file against .env.example.',
    ].join('\n');

    throw new Error(errorMessage);
  }

  return result.data;
}

const env = validateConfig();

export const config = {
  port: parseInt(env.PORT, 10),
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  aesKey: env.AES_KEY,
  nodeEnv: env.NODE_ENV,
  allowedOrigin: env.CORS_ORIGIN || env.ALLOWED_ORIGIN,
  pusherAppId: env.PUSHER_APP_ID,
  pusherKey: env.PUSHER_KEY,
  pusherSecret: env.PUSHER_SECRET,
  pusherCluster: env.PUSHER_CLUSTER,
};
