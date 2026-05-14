type LogCategory = 'AUTH' | 'DATABASE' | 'SERVER' | 'SOCKET' | 'AI' | 'ERROR';

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

import { config } from '../config/index.js';

const IS_DEV = config.nodeEnv === 'development';

export const logger = {
  info: (category: LogCategory, message: string, data?: unknown) => {
    if (!IS_DEV) return;
    console.log(
      `${colors.dim}[${new Date().toISOString()}]${colors.reset} ` +
      `${colors.cyan}[${category}]${colors.reset} ` +
      `${message}`
    );
    if (data) {
      console.log(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  },

  warn: (category: LogCategory, message: string, data?: unknown) => {
    if (!IS_DEV) return;
    console.log(
      `${colors.dim}[${new Date().toISOString()}]${colors.reset} ` +
      `${colors.yellow}[${category}]${colors.reset} ` +
      `${message}`
    );
    if (data) {
      console.log(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  },

  error: (category: LogCategory, message: string, error?: unknown) => {
    // We ALWAYS log errors, even in production, but we use console.error
    console.error(
      `${colors.dim}[${new Date().toISOString()}]${colors.reset} ` +
      `${colors.red}[${category}]${colors.reset} ` +
      `${colors.red}${message}${colors.reset}`
    );
    if (error) {
      console.error(`${colors.red}${error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}${colors.reset}`);
    }
  },
};
