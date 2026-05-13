import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'AES_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`[ERR_MISSING_ENV_VAR] ${envVar} is not defined in the environment.`);
    process.exit(1);
  }
}

export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    saltRounds: 10,
  },
  security: {
    aesKey: process.env.AES_KEY!,
  },
  ai: {
    googleKey: process.env.GOOGLE_AI_KEY!,
  },
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  }
};
