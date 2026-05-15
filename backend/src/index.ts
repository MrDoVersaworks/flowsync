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
import { SocketEvent } from './constants.js';

const app = express();
const server = http.createServer(app);

// ============================================================
// SOCKET.IO REAL-TIME ENGINE (Initialized early for services)
// ============================================================
const io = new Server(server, {
  cors: {
    origin: [config.allowedOrigin, 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  }
});
export { io };

// Timeout Halt Middleware (Fulfills Rule F2 - No 'any')
const haltOnTimeout = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.timedout) next();
};

// Route Imports (Must come AFTER io initialization if services use io)
import authRoutes from './routes/auth.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import kanbanRoutes from './routes/kanban.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import aiRoutes from './routes/ai.routes.js';
import commentRoutes from './routes/comment.routes.js';

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
app.use('/api/comments', timeout('15s'), haltOnTimeout, generalRateLimiter, authMiddleware, commentRoutes);

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

// Map to track active collaborative minds
const activeMinds = new Map<string, Set<{ userId: string, name: string, socketId: string }>>();

io.on('connection', (socket) => {
  logger.info('SOCKET', `Intelligence linked: ${socket.id}`);

  socket.on(SocketEvent.JOIN_WORKSPACE, (data: { workspaceId: string, user: { id: string, name: string } }) => {
    const { workspaceId, user } = data;
    socket.join(workspaceId);
    
    // Store user info in socket data for cleanup
    (socket as any).userId = user.id;
    (socket as any).workspaceId = workspaceId;
    (socket as any).userName = user.name;

    // Track active minds (Ensure no duplicates for the same socketId)
    if (!activeMinds.has(workspaceId)) {
      activeMinds.set(workspaceId, new Set());
    }
    const minds = activeMinds.get(workspaceId)!;
    // Remove any existing entry for this specific socketId if it exists (e.g. on re-join)
    for (const mind of minds) {
      if (mind.socketId === socket.id) {
        minds.delete(mind);
        break;
      }
    }
    minds.add({ userId: user.id, name: user.name, socketId: socket.id });

    // Broadcast current presence to everyone in the room (Deduplicate by userId)
    const members = Array.from(new Map(
      Array.from(activeMinds.get(workspaceId)!).map(m => [m.userId, m])
    ).values());
    io.to(workspaceId).emit(SocketEvent.PRESENCE_UPDATED, members);
    
    logger.info('SOCKET', `User ${user.name} synchronized with workspace: ${workspaceId}`);
  });

  socket.on(SocketEvent.LEAVE_WORKSPACE, () => {
    const wsId = (socket as any).workspaceId;
    if (wsId && activeMinds.has(wsId)) {
      const minds = activeMinds.get(wsId)!;
      for (const mind of minds) {
        if (mind.socketId === socket.id) {
          minds.delete(mind);
          break;
        }
      }
      const members = Array.from(new Map(
        Array.from(minds).map(m => [m.userId, m])
      ).values());
      io.to(wsId).emit(SocketEvent.PRESENCE_UPDATED, members);
      socket.leave(wsId);
      logger.info('SOCKET', `Intelligence decoupled (Explicit Leave): ${socket.id}`);
    }
  });

  socket.on('disconnect', () => {
    const wsId = (socket as any).workspaceId;
    const uId = (socket as any).userId;

    if (wsId && activeMinds.has(wsId)) {
      const minds = activeMinds.get(wsId)!;
      for (const mind of minds) {
        if (mind.socketId === socket.id) {
          minds.delete(mind);
          break;
        }
      }
      
      // Broadcast updated presence (Deduplicate by userId)
      const members = Array.from(new Map(
        Array.from(minds).map(m => [m.userId, m])
      ).values());
      io.to(wsId).emit(SocketEvent.PRESENCE_UPDATED, members);
    }

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
