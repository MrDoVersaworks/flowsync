type LogCategory = 'SERVER' | 'DATABASE' | 'AUTH' | 'SOCKET' | 'AI' | 'ERROR';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  fg: {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  },
};

const categoryColors: Record<LogCategory, string> = {
  SERVER: colors.fg.cyan,
  DATABASE: colors.fg.magenta,
  AUTH: colors.fg.green,
  SOCKET: colors.fg.blue,
  AI: colors.fg.yellow,
  ERROR: colors.fg.red,
};

export const logger = {
  info: (category: LogCategory, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const color = categoryColors[category];
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ${color}${colors.bright}[${category}]${colors.reset} ${message}`
    );
    if (data) {
      console.log(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  },
  warn: (category: LogCategory, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(
      `${colors.dim}[${timestamp}]${colors.reset} ${colors.fg.yellow}${colors.bright}[WARN][${category}]${colors.reset} ${message}`
    );
    if (data) {
      console.log(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  },
  error: (category: LogCategory, message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(
      `${colors.dim}[${timestamp}]${colors.reset} ${colors.fg.red}${colors.bright}[ERROR][${category}]${colors.reset} ${message}`
    );
    if (error) {
      console.error(error);
    }
  },
};
