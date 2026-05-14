import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import timeout from 'connect-timeout';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { authMiddleware } from './middleware/auth.js';
import { generalRateLimiter, authRateLimiter, aiRateLimiter } from './middleware/rateLimiter.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import kanbanRoutes from './routes/kanban.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Timeout Halt Middleware (Fulfills Rule F2 - No 'any')
const haltOnTimeout = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.timedout) next();
};

const app = express();
const server = http.createServer(app);

// ============================================================
// SECURITY & INFRASTRUCTURE GUARDS
// ============================================================
// ============================================================
// SECURITY & INFRASTRUCTURE GUARDS
// ============================================================
app.use(helmet());
app.use(helmet());
app.use(cors({
  origin: config.allowedOrigin.includes(',')
    ? config.allowedOrigin.split(',').map(o => o.trim())
    : config.allowedOrigin,
  credentials: true,
}));

// ============================================================
// PARSING & STATE
// ============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'flowsync-backend', 
    timestamp: new Date().toISOString() 
  });
});

// ============================================================
// SOVEREIGN API GATEWAYS
// ============================================================
app.use('/api/auth', timeout('15s'), haltOnTimeout, authRateLimiter, authRoutes);
app.use('/api/workspaces', timeout('15s'), haltOnTimeout, generalRateLimiter, authMiddleware, workspaceRoutes);
app.use('/api/kanban', timeout('15s'), haltOnTimeout, generalRateLimiter, authMiddleware, kanbanRoutes);
app.use('/api/settings', timeout('15s'), haltOnTimeout, generalRateLimiter, authMiddleware, settingsRoutes);

// AI routes require more time for generative inception
app.use('/api/ai', timeout('60s'), haltOnTimeout, generalRateLimiter, aiRateLimiter, authMiddleware, aiRoutes);

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ERR_NOT_FOUND',
      message: 'The requested sanctuary endpoint does not exist.',
    }
  });
});

// ============================================================
// GLOBAL ERROR ORCHESTRATION
// ============================================================
app.use(errorHandler);

// ============================================================
// SOCKET.IO REAL-TIME ENGINE
// ============================================================
const io = new Server(server, {
  cors: {
    origin: [config.allowedOrigin, 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

io.on('connection', (socket) => {
  logger.info('SOCKET', `Intelligence linked: ${socket.id}`);

  socket.on('join-workspace', (workspaceId: string) => {
    socket.join(workspaceId);
    logger.info('SOCKET', `User ${socket.id} synchronized with workspace: ${workspaceId}`);
  });

  socket.on('disconnect', () => {
    logger.info('SOCKET', `Intelligence decoupled: ${socket.id}`);
  });
});

// ============================================================
// SERVER INCEPTION
// ============================================================
const PORT = config.port;
server.listen(PORT, () => {
  logger.info('SERVER', `FlowSync Infrastructure active on port ${PORT}`);
  logger.info('SERVER', `Environment: ${config.nodeEnv}`);
});

export { io };
